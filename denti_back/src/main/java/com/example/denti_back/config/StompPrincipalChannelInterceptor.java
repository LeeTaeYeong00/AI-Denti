package com.example.denti_back.config;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class StompPrincipalChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            Object auth = accessor.getSessionAttributes() != null
                    ? accessor.getSessionAttributes().get("authentication")
                    : null;

            if (auth instanceof Authentication authentication) {
                accessor.setUser(authentication);
            }
        }

        return message;
    }
}