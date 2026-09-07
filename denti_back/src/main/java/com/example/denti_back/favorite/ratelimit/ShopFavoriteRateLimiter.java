package com.example.denti_back.favorite.ratelimit;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;

@Component
public class ShopFavoriteRateLimiter {

    // 사용자별 Rate Limit 정보를 저장한다.
    // 30분 동안 요청하지 않은 사용자 정보는 자동 제거한다.
    private final Cache<Long, Bucket> userBuckets =
            Caffeine.newBuilder()
                    .maximumSize(10_000)
                    .expireAfterAccess(
                            Duration.ofMinutes(30))
                    .build();

    // 현재 사용자의 즐겨찾기 변경 요청을 허용할 수 있는지 확인한다.
    public RateLimitResult tryConsume(
            Long currentUserId) {

        if (currentUserId == null) {
            throw new IllegalArgumentException(
                    "로그인 사용자 정보가 필요합니다.");
        }

        Bucket bucket = userBuckets.get(
                currentUserId,
                ignored -> createBucket());

        ConsumptionProbe probe =
                bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            return new RateLimitResult(
                    true,
                    probe.getRemainingTokens(),
                    0);
        }

        long retryAfterSeconds =
                calculateRetryAfterSeconds(
                        probe.getNanosToWaitForRefill());

        return new RateLimitResult(
                false,
                probe.getRemainingTokens(),
                retryAfterSeconds);
    }

    // 사용자별 요청 제한 규칙을 생성한다.
    private Bucket createBucket() {
        return Bucket.builder()

                // 처음에는 최대 5번까지 연속 요청을 허용하고,
                // 이후에는 1초마다 요청 가능 횟수 1개를 회복한다.
                .addLimit(limit ->
                        limit.capacity(5)
                                .refillGreedy(
                                        1,
                                        Duration.ofSeconds(1)))

                // 한 사용자가 1분 동안 최대 30번까지만
                // 즐겨찾기 상태를 변경할 수 있도록 제한한다.
                .addLimit(limit ->
                        limit.capacity(30)
                                .refillGreedy(
                                        30,
                                        Duration.ofMinutes(1)))

                .build();
    }

    // 나노초 단위의 대기 시간을 초 단위로 올림 처리한다.
    private long calculateRetryAfterSeconds(
            long nanosToWait) {

        long seconds =
                TimeUnit.NANOSECONDS.toSeconds(
                        nanosToWait);

        if (nanosToWait
                % TimeUnit.SECONDS.toNanos(1) != 0) {
            seconds++;
        }

        return Math.max(1, seconds);
    }

    // Controller에 요청 허용 여부와 재시도 시간을 전달한다.
    public record RateLimitResult(
            boolean allowed,
            long remainingTokens,
            long retryAfterSeconds) {
    }
}