import { getContext, extension_settings } from "../../../../extensions.js";
import { eventSource, event_types } from "../../../../script.js";

// 설정 초기화
extension_settings.mobile_expression = extension_settings.mobile_expression || {
    enabled: true
};

// 모바일 환경 확인
function isMobile() {
    return window.innerWidth <= 768;
}

// 표정 DOM 요소 생성
function createExpressionElement(messageBlock) {
    // 이미 존재하는 표정 제거
    messageBlock.find('.mobile-expression-wrapper').remove();
    
    // 원본 표정 이미지 참조
    const originalExpression = document.getElementById('expression-image');
    if (!originalExpression || !originalExpression.src || originalExpression.src.endsWith('.svg')) {
        return;
    }
    
    // 새 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'mobile-expression-wrapper';
    
    // 이미지 복제
    const img = document.createElement('img');
    img.className = 'mobile-expression-img';
    img.src = originalExpression.src;
    img.alt = 'Character expression';
    img.dataset.expression = originalExpression.dataset.expression;
    
    container.appendChild(img);
    
    // 메시지 블록 최상단에 삽입
    messageBlock.prepend(container);
}

// 모든 메시지에 표정 추가
function processAllMessages() {
    if (!extension_settings.mobile_expression.enabled || !isMobile()) return;
    
    $('.mes_block').each(function() {
        createExpressionElement($(this));
    });
}

// 새 메시지 감지
function setupEventListeners() {
    // 메시지 수신시
    eventSource.on(event_types.MESSAGE_RECEIVED, () => {
        setTimeout(processLatestMessage, 100);
    });
    
    eventSource.on(event_types.MESSAGE_SENT, () => {
        setTimeout(processLatestMessage, 100);
    });
    
    // 화면 크기 변경시
    window.addEventListener('resize', debounce(() => {
        processAllMessages();
    }, 300));
    
    // 표정 변경 감지
    const observer = new MutationObserver((mutations) => {
        const expressionChanged = mutations.some(mutation => 
            mutation.target.id === 'expression-image' && 
            mutation.attributeName === 'src'
        );
        
        if (expressionChanged) {
            setTimeout(processAllMessages, 100);
        }
    });
    
    const expressionImg = document.getElementById('expression-image');
    if (expressionImg) {
        observer.observe(expressionImg, { attributes: true });
    }
}

// 최신 메시지만 처리
function processLatestMessage() {
    if (!extension_settings.mobile_expression.enabled || !isMobile()) return;
    
    const latestMessage = $('.mes_block').last();
    if (latestMessage.length) {
        createExpressionElement(latestMessage);
    }
}

// 유틸리티: 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 확장 초기화
export function initializeExtension() {
    setupEventListeners();
    processAllMessages();
    console.log('Mobile Expression Display extension initialized');
}

// 확장 진입점
export function onLoaded() {
    initializeExtension();
}
