package com.example.denti_back.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<String> handleIllegalArgument(
                        IllegalArgumentException e) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(e.getMessage());
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<String> handleIllegalState(
                        IllegalStateException e) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(e.getMessage());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<String> handleValidationException(
                        MethodArgumentNotValidException e) {
                String message = e.getBindingResult()
                                .getFieldErrors()
                                .get(0)
                                .getDefaultMessage();

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(message);
        }

        @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
        public ResponseEntity<String> handleMaxUploadSize(
                        org.springframework.web.multipart.MaxUploadSizeExceededException e) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body("업로드 가능한 파일 용량을 초과했습니다.");
        }
}