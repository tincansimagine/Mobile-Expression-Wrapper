import { getContext, extension_settings, saveSettingsDebounced } from "../../../../extensions.js";
import { eventSource, event_types } from "../../../../script.js";

// 모바일 환경 인식
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// 설정 초기화
extension_settings.mobile_expression = extension_settings.mobile_expression || {
    enabled: true,
    position: 'top', // 'top', 'inline'
    size: 80 // px
};

// 기본 설정
const settings = extension_settings.mobile_expression;

// 모바일용 표정 DOM 요소 생성
function createMobileExpression(messageBlock) {
    // 이미 존재하는 경우 제거
    const existingExpression = messageBlock.querySelector('.mobile-expression-container');
    if (existingExpression) {
        existingExpression.remove();
    }
    
    // 원본 표정 요소 참조
    const originalExpression = document.getElementById('expression-image');
    if (!originalExpression) return;
    
    // 새 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'mobile-expression-container';
    
    // 이미지 복제
    const img = document.createElement('img');
    img.className = 'mobile-expression-img';
    img.src = originalExpression.src;
    img.alt = originalExpression.alt || 'Character expression';
    img.dataset.spriteFolder = originalExpression.dataset.spriteFolderName;
    img.dataset.expression = originalExpression.dataset.expression;
    
    container.appendChild(img);
    
    // 메시지 블록 최상단에 삽입
    messageBlock.prepend(container);
}

// 모든 메시지에 표정 추가
function processAllMessages() {
    if (!settings.enabled || !isMobileDevice()) return;
    
    document.querySelectorAll('.mes_block').forEach(block => {
        createMobileExpression(block);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 새 메시지 생성시
    eventSource.on(event_types.MESSAGE_SENT, () => {
        setTimeout(processAllMessages, 100); // 약간의 지연으로 DOM이 업데이트될 시간 제공
    });
    
    eventSource.on(event_types.MESSAGE_RECEIVED, () => {
        setTimeout(processAllMessages, 100);
    });
    
    // 화면 크기 변경시
    window.addEventListener('resize', () => {
        processAllMessages();
    });
    
    // 표정 변경 감지
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'src' && 
                mutation.target.id === 'expression-image') {
                processAllMessages();
            }
        });
    });
    
    const expressionImg = document.getElementById('expression-image');
    if (expressionImg) {
        observer.observe(expressionImg, { attributes: true });
    }
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
