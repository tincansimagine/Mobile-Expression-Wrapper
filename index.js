import { getContext, extension_settings } from "../../../extensions.js";
import { eventSource, event_types } from "../../../../script.js";

// 설정 초기화
extension_settings.mobile_expressions = extension_settings.mobile_expressions || {
    enabled: true
};

// 확장 초기화
export function onLoaded() {
    setupEventListeners();
    console.log('Mobile Expressions extension loaded');
}

function setupEventListeners() {
    // 새 메시지 수신시
    eventSource.on(event_types.MESSAGE_RECEIVED, () => {
        setTimeout(processLatestMessage, 100);
    });
    
    // 메시지 전송시
    eventSource.on(event_types.MESSAGE_SENT, () => {
        setTimeout(processAllMessages, 100);
    });
    
    // 화면 크기 변경시
    window.addEventListener('resize', debounce(() => {
        processAllMessages();
    }, 300));
    
    // 초기 로드시
    processAllMessages();
}

// 모바일 확인
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// 모든 메시지 처리
function processAllMessages() {
    if (!extension_settings.mobile_expressions.enabled || !isMobileDevice()) {
        removeAllMobileExpressions();
        return;
    }
    
    document.querySelectorAll('.mes_block').forEach(block => {
        // AI 메시지인지 확인 (캐릭터 이름이 있는 경우)
        const nameElement = block.querySelector('.name_text');
        const isAIMessage = nameElement && nameElement.textContent.trim() !== 'You';
        
        if (isAIMessage) {
            addExpressionToMessage(block);
        } else {
            // 사용자 메시지라면 표정 제거
            removeExpressionFromMessage(block);
        }
    });
}

// 최신 메시지만 처리
function processLatestMessage() {
    if (!extension_settings.mobile_expressions.enabled || !isMobileDevice()) return;
    
    const latestMessage = document.querySelector('.mes_block:last-child');
    if (!latestMessage) return;
    
    const nameElement = latestMessage.querySelector('.name_text');
    const isAIMessage = nameElement && nameElement.textContent.trim() !== 'You';
    
    if (isAIMessage) {
        addExpressionToMessage(latestMessage);
    } else {
        removeExpressionFromMessage(latestMessage);
    }
}

// 메시지에 표정 추가
function addExpressionToMessage(messageBlock) {
    // 이미 존재하는 표정 제거
    removeExpressionFromMessage(messageBlock);
    
    // 원본 표정 이미지 참조
    const originalExpression = document.getElementById('expression-image');
    if (!originalExpression || !originalExpression.src) {
        console.log('원본 표정 이미지를 찾을 수 없음');
        return;
    }
    
    console.log('표정 이미지 URL:', originalExpression.src);
    
    // 새 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'mobile-expression-container';
    
    // 이미지 생성
    const img = document.createElement('img');
    img.className = 'mobile-expression-img';
    img.src = originalExpression.src;
    img.alt = 'Character expression';
    
    // 디버깅 코드
    img.onload = function() {
        console.log('✅ 이미지 로딩 성공:', img.src);
        img.style.opacity = '1';
    };
    
    img.onerror = function() {
        console.error('❌ 이미지 로딩 실패:', img.src);
        // 직접 경로 시도
        const spriteName = originalExpression.dataset.expression || 'neutral';
        const characterName = originalExpression.dataset.spriteFolderName;
        if (characterName) {
            img.src = `/characters/${characterName}/${spriteName}.png`;
            console.log('대체 경로 시도:', img.src);
        }
    };
    
    // 디버깅용 스타일
    container.style.border = '2px solid red';
    img.style.opacity = '0.5';
    
    container.appendChild(img);
    messageBlock.prepend(container);
}

// 메시지에서 표정 제거
function removeExpressionFromMessage(messageBlock) {
    const existing = messageBlock.querySelector('.mobile-expression-container');
    if (existing) {
        existing.remove();
    }
}

// 모든 표정 제거
function removeAllMobileExpressions() {
    document.querySelectorAll('.mobile-expression-container').forEach(el => el.remove());
}

// 유틸리티: 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
}