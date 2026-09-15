package com.example.denti_back.member.security;

import com.example.denti_back.member.entity.User;
import com.example.denti_back.member.enums.Provider;
import com.example.denti_back.member.enums.Role;
import com.example.denti_back.member.enums.UserStatus;
import com.example.denti_back.member.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        if (!"kakao".equals(registrationId)) {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인입니다: " + registrationId);
        }

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId = String.valueOf(attributes.get("id"));

        User user = userRepository.findByProviderAndProviderId(Provider.KAKAO, providerId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setProvider(Provider.KAKAO);
                    newUser.setProviderId(providerId);
                    // 이메일 동의항목 미설정 -> 여기서는 email 안 채움, 추가정보 입력 단계에서 직접 받음
                    newUser.setRole(Role.GENERAL);
                    newUser.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(newUser);
                });

        return new CustomOAuth2User(user, attributes);
    }
}