package com.example.denti_back.shop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.denti_back.shop.dto.ProductRequestDto;
import com.example.denti_back.shop.entity.Product;
import com.example.denti_back.shop.entity.RepairShop;
import com.example.denti_back.shop.repository.ProductRepository;
import com.example.denti_back.shop.repository.RepairShopRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final RepairShopRepository repairShopRepository;

    // 전체 판매 상품 조회
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(
                productRepository.findByActiveTrue()
        );
    }

    // 특정 정비소의 판매 상품 조회
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<Product>> getProductsByShop(
            @PathVariable Long shopId
    ) {
        return ResponseEntity.ok(
                productRepository.findByShop_ShopIdAndActiveTrue(shopId)
        );
    }

    // 상품 상세 조회
    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProduct(
            @PathVariable Long productId
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "상품을 찾을 수 없습니다."
                        ));

        return ResponseEntity.ok(product);
    }

    // 정비소 상품 등록
    @PostMapping("/shop/{shopId}")
    public ResponseEntity<Product> createProduct(
            @PathVariable Long shopId,
            @RequestBody ProductRequestDto request
    ) {

        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "정비소를 찾을 수 없습니다."
                        ));

        Product product = new Product();

        product.setShop(shop);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setActive(true);

        return ResponseEntity.ok(
                productRepository.save(product)
        );
    }

    // 상품 수정
    @PutMapping("/{productId}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long productId,
            @RequestBody ProductRequestDto request
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "상품을 찾을 수 없습니다."
                        ));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        return ResponseEntity.ok(
                productRepository.save(product)
        );
    }

    // 상품 판매 중지
    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long productId
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "상품을 찾을 수 없습니다."
                        ));

        product.setActive(false);
        productRepository.save(product);

        return ResponseEntity.ok(
                "상품 판매가 중지되었습니다."
        );
    }
}