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

// 메시지 블록에 표정 추가
function addExpressionToMessage(messageBlock) {
    // 이전 표정 제거
    removeExpressionFromMessage(messageBlock);
    
    // 원본 표정 참조
    const originalExpression = document.getElementById('expression-image');
    if (!originalExpression || !originalExpression.src) {
        console.error('원본 표정 이미지 찾을 수 없음');
        return;
    }
    
    // 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'mobile-expression-container';

    container.style.border = '2px solid red';
    
    // 이미지 생성 및 속성 설정
    const img = document.createElement('img');
    img.className = 'mobile-expression-img';
    
    // 절대 경로로 이미지 설정 (중요!)
    const characterName = originalExpression.dataset.spriteFolderName;
    const expressionName = originalExpression.dataset.expression || 'neutral';
    
    // 타임스탬프 추가로 캐싱 방지
    const timestamp = new Date().getTime();
    img.src = `/characters/${characterName}/${expressionName}.png?t=${timestamp}`;
    
    img.alt = `${characterName} ${expressionName}`;
    img.title = expressionName;
    
    // 디버깅용 콘솔 로그
    console.log(`모바일 표정 추가: ${img.src}`);
    
    // 이벤트 핸들러
    img.onload = () => console.log('✅ 이미지 로드 성공:', img.src);
    img.onerror = () => console.error('❌ 이미지 로드 실패:', img.src);
    
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