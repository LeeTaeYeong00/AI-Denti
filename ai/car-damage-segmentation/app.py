# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import cv2
import numpy as np
from src.Models import Unet

app = Flask(__name__)
CORS(app)

LABELS = ['Breakage_3', 'Crushed_2', 'Scratch_0', 'Seperated_1']
PRICE_TABLE = {
    'Breakage_3': 100,
    'Crushed_2': 200,
    'Scratch_0': 50,
    'Seperated_1': 120,
}
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

models = {}

def load_models():
    for label in LABELS:
        model_path = f'models/[DAMAGE][{label}]Unet.pt'
        model = Unet(encoder='resnet34', pre_weight='imagenet', num_classes=2).to(DEVICE)
        model.model.load_state_dict(torch.load(model_path, map_location=DEVICE))
        model.eval()
        models[label] = model
    print('모델 로드 완료')

def preprocess(image_bytes):
    file_bytes = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (256, 256))

    img_input = img / 255.
    img_input = img_input.transpose([2, 0, 1])
    img_input = torch.tensor(img_input).float().to(DEVICE).unsqueeze(0)
    return img_input

@app.route('/analyze', methods=['POST'])
def analyze():
    file = request.files['image']
    img_input = preprocess(file.read())

    result = {}
    total = 0
    for label in LABELS:
        output = models[label](img_input)
        mask = torch.argmax(output, dim=1).detach().cpu().numpy()
        area = int(mask.sum())
        cost = area * PRICE_TABLE[label]
        total += cost
        result[label] = {'pixelArea': area, 'estimatedCost': cost}

    return jsonify({'details': result, 'totalCost': total})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5000)