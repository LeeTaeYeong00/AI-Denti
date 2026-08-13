package com.example.denti_back.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.denti_back.member.entity.User;

// 회원 정보를 데이터베이스에서 조회하고 저장하기 위한 Repository이다.
// JpaRepository를 상속하여 findById, save, delete 등의 기본 기능을 사용한다.
public interface UserRepository
        extends JpaRepository<User, Long> {
}