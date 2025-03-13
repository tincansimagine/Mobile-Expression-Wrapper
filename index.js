import { getContext, extension_settings } from "../../../extensions.js";
import { eventSource, event_types } from "../../../../script.js";

// 확장 초기화
export function onLoaded() {
    // 설정 초기화
    extension_settings.mobile_expressions = extension_settings.mobile_expressions || {
        enabled: true
    };
    
    // 이벤트 처리 등록
    setupEventListeners();
    console.log('Mobile Expressions extension loaded');
}

function setupEventListeners() {
    // 메시지 수신 이벤트
    eventSource.on(event_types.MESSAGE_RECEIVED, () => {
        setTimeout(insertExpressionToLastMessage, 100);
    });
    
    // 메시지 전송 이벤트
    eventSource.on(event_types.MESSAGE_SENT, () => {
        setTimeout(insertExpressionToLastMessage, 100);
    });
    
    // 화면 크기 변경 시 처리
    window.addEventListener('resize', () => {
        if (isMobileDevice()) {
            processAllMessages();
        }
    });
}

// 모바일 기기 확인
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// 모든 메시지에 표정 삽입
function processAllMessages() {
    if (!extension_settings.mobile_expressions.enabled || !isMobileDevice()) return;
    
    document.querySelectorAll('.mes_block').forEach(block => {
        insertExpressionToMessage(block);
    });
}

// 마지막 메시지에 표정 삽입
function insertExpressionToLastMessage() {
    if (!extension_settings.mobile_expressions.enabled || !isMobileDevice()) return;
    
    const lastMessage = document.querySelector('.mes_block:last-child');
    if (lastMessage) {
        insertExpressionToMessage(lastMessage);
    }
}

// 메시지 블록에 표정 삽입
function insertExpressionToMessage(messageBlock) {
    // 이미 존재하는 모바일 표정 제거
    const existingExpression = messageBlock.querySelector('.mobile-expression-container');
    if (existingExpression) {
        existingExpression.remove();
    }
    
    // 원본 표정 이미지 가져오기
    const originalExpression = document.getElementById('expression-image');
    if (!originalExpression || !originalExpression.src || originalExpression.src.endsWith('.svg')) {
        return;
    }
    
    // 새 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'mobile-expression-container';
    
    // 이미지 복제
    const img = document.createElement('img');
    img.className = 'mobile-expression-img';
    img.src = originalExpression.src;
    img.alt = 'Character expression';
    if (originalExpression.dataset.expression) {
        img.dataset.expression = originalExpression.dataset.expression;
    }
    
    container.appendChild(img);
    
    // 메시지 블록 최상단에 삽입
    messageBlock.prepend(container);
}
