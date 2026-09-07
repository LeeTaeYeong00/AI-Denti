FROM python:3.10-slim

WORKDIR /app

# OpenCV 실행에 필요한 시스템 패키지
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt .

RUN pip install --no-cache-dir -r requirements-docker.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]