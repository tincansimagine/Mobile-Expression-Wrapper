import { getContext } from '../../../extensions.js';

export function modifyDOM() {
    const context = getContext();
    const observer = new MutationObserver((mutations) => {
        handleMobileLayout();
    });

    // DOM 변경 감지
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 초기 실행
    handleMobileLayout();
}

function handleMobileLayout() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const expressionWrapper = document.getElementById('expression-wrapper');
    const mesBlocks = document.querySelectorAll('.mes_block');

    mesBlocks.forEach(block => {
        if (isMobile) {
            const clone = expressionWrapper.cloneNode(true);
            block.insertBefore(clone, block.firstChild);
        } else {
            const existingClone = block.querySelector('#expression-wrapper');
            if (existingClone) existingClone.remove();
        }
    });
}

// 창 크기 변경 이벤트 핸들러
window.addEventListener('resize', () => {
    handleMobileLayout();
});
