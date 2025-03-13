export function modifyDOM() {
    const context = getContext();
    const originalWrapper = document.getElementById('expression-wrapper');

    function injectExpression(mesBlock) {
        if(!mesBlock) return;
        
        const clone = originalWrapper.cloneNode(true);
        clone.id = '';
        clone.className = 'mobile-expression';
        
        const existing = mesBlock.querySelector('.mobile-expression');
        existing?.remove();
        mesBlock.prepend(clone);
    }

    // 새 메시지 생성시 이벤트 핸들링
    context.eventSource.on(context.event_types.MESSAGE_RECEIVED, (message) => {
        const lastMessage = document.querySelector('.mes_block:last-child');
        injectExpression(lastMessage);
    });

    // 기존 메시지 처리
    document.querySelectorAll('.mes_block').forEach(injectExpression);
    
    // 화면 크기 변경 감지
    let isMobile = window.matchMedia('(max-width: 768px)').matches;
    window.addEventListener('resize', () => {
        const newIsMobile = window.matchMedia('(max-width: 768px)').matches;
        if(isMobile !== newIsMobile) {
            isMobile = newIsMobile;
            document.querySelectorAll('.mobile-expression').forEach(el => el.remove());
            if(newIsMobile) document.querySelectorAll('.mes_block').forEach(injectExpression);
        }
    });
}
