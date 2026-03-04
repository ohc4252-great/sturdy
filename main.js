// 1. 데이터 정의 (총 21개 소단원)
const CHAPTER_DATA = [
    {
        title: "수1",
        subs: ["지수와로그", "지수함수와 로그함수", "호도법,일반각,삼각비", "삼각함수", "등차수열과 등비수열", "수열의 합과 수학적 귀납법"]
    },
    {
        title: "수2",
        subs: ["함수의극한", "함수의연속", "미분계수와 도함수", "도함수의 활용", "삼차함수와 사차함수의 그래프", "부정적분과 정적분", "정적분의 활용"]
    },
    {
        title: "확통",
        subs: ["순열과 조합 기본", "경우의 수", "이항정리", "확률의 정의와 덧셈정리", "조건부 확률과 곱셈 정리", "이산확률분포", "연속확률분포", "통계적추정"]
    },
    {
        title: "미적분",
        subs: ["수열의 극한", "급수", "지수·로그함수의 극한과 도함수", "삼각함수의 극한과 도함수", "여러 가지 미분법", "도함수의 활용", "여러 가지 적분법", "정적분의 활용"]
    },
    {
        title: "기하",
        subs: ["포물선", "타원", "쌍곡선", "벡터의 정의와 연산", "공간도형", "공간좌표와 구"]
    }
];

const STAGES = {
    DAY1: { label: "1일차", desc: "강의 수강 + 개인노트 필기 + BQ 1에 풀기" },
    DAY2: { label: "2일차", desc: "개인노트 자신에게 설명하며 갈고닦기 + 책 NOTE에 정리 + BQ 2에 풀기" },
    DAY3: { label: "3일차", desc: "SQ, FINAL 1에 풀기 + 해설 보고 2에 다시 풀기" },
    FINAL: { label: "일주일 복습", desc: "BQ/SQ/TQ/FINAL 모두 다시 풀기(설명할 수 있을 정도로)" }
};

// 2. 상태 관리 (LocalStorage 연동)
let state = {
    cycleCount: 1,
    progress: {} // { "수1-지수와로그": { status: 'START', lastDate: '2023-10-25' } }
};

function saveState() {
    localStorage.setItem('mathStudyState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('mathStudyState');
    if (saved) {
        state = JSON.parse(saved);
    }
}

// 3. 유틸리티 함수
function getTodayString() {
    // 로컬 타임존 기준 YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDaysDiff(dateStr1, dateStr2) {
    if (!dateStr1 || !dateStr2) return 0;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    // 시간 성분을 제거하고 날짜 차이만 계산
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
}

// 4. 렌더링 로직
function renderApp() {
    document.getElementById('cycle-count').innerText = state.cycleCount;
    renderTodo();
    renderTree();
}

function renderTodo() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    const today = getTodayString();
    let hasTask = false;

    // 모든 진행 중인 단원을 검사하여 오늘 할 일 결정
    Object.keys(state.progress).forEach(id => {
        const prog = state.progress[id];
        let currentTask = null;

        // 핵심 사이클 로직
        if (prog.status === 'START') {
            // 시작 버튼 누른 즉시 1일차 할 일 등장
            currentTask = { stage: 'DAY1', ...STAGES.DAY1 };
        } else if (prog.status === 'DAY1_DONE' && today > prog.lastDate) {
            // 1일차 완료 후 다음날 자정이 지나면 2일차 등장
            currentTask = { stage: 'DAY2', ...STAGES.DAY2 };
        } else if (prog.status === 'DAY2_DONE' && today > prog.lastDate) {
            // 2일차 완료 후 다음날 자정이 지나면 3일차 등장
            currentTask = { stage: 'DAY3', ...STAGES.DAY3 };
        } else if (prog.status === 'DAY3_DONE' && getDaysDiff(today, prog.lastDate) >= 2) {
            // 3일차 완료일 기준 정확히 +2일 뒤 (즉 3일째 되는 날 자정 이후)
            currentTask = { stage: 'FINAL', ...STAGES.FINAL };
        }

        if (currentTask) {
            hasTask = true;
            const item = document.createElement('div');
            item.className = 'todo-item';
            item.innerHTML = `
                <input type="checkbox" onchange="completeTask('${id}', '${currentTask.stage}')">
                <span><strong>[${id}]</strong> ${currentTask.label}<br><small>${currentTask.desc}</small></span>
            `;
            todoList.appendChild(item);
        }
    });

    if (!hasTask) {
        todoList.innerHTML = '<p class="empty-msg">오늘 할 일이 없습니다. 단원을 시작해 보세요!</p>';
    }
}

function renderTree() {
    const treeContainer = document.getElementById('chapter-tree');
    treeContainer.innerHTML = '';

    CHAPTER_DATA.forEach(category => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `<span>${category.title}</span> <span>▾</span>`;
        header.onclick = () => {
            const content = item.querySelector('.accordion-content');
            content.classList.toggle('active');
        };

        const content = document.createElement('div');
        content.className = 'accordion-content';

        category.subs.forEach(sub => {
            const id = `${category.title} - ${sub}`;
            const prog = state.progress[id];
            
            const subRow = document.createElement('div');
            subRow.className = 'sub-chapter';
            
            let statusText = '미시작';
            let badgeClass = '';
            let btnDisabled = false;

            if (prog) {
                if (prog.status === 'COMPLETED') {
                    statusText = '완료';
                    badgeClass = 'done';
                    btnDisabled = true;
                } else {
                    // 진행 중인 상태 표시
                    let stageLabel = "";
                    if (prog.status === 'START') stageLabel = "1일차 대기";
                    else if (prog.status === 'DAY1_DONE') stageLabel = "2일차 대기";
                    else if (prog.status === 'DAY2_DONE') stageLabel = "3일차 대기";
                    else if (prog.status === 'DAY3_DONE') stageLabel = "복습 대기";
                    
                    statusText = stageLabel;
                    badgeClass = 'ongoing';
                    btnDisabled = true;
                }
            }

            subRow.innerHTML = `
                <span>${sub}</span>
                <div>
                    <span class="status-badge ${badgeClass}">${statusText}</span>
                    <button ${btnDisabled ? 'disabled' : ''} onclick="startChapter('${id}')">시작</button>
                </div>
            `;
            content.appendChild(subRow);
        });

        item.appendChild(header);
        item.appendChild(content);
        treeContainer.appendChild(item);
    });
}

// 5. 동작 로직
window.startChapter = function(id) {
    if (state.progress[id]) return;
    state.progress[id] = {
        status: 'START',
        lastDate: ''
    };
    saveState();
    renderApp();
};

window.completeTask = function(id, stage) {
    const today = getTodayString();
    const prog = state.progress[id];

    if (stage === 'DAY1') prog.status = 'DAY1_DONE';
    else if (stage === 'DAY2') prog.status = 'DAY2_DONE';
    else if (stage === 'DAY3') prog.status = 'DAY3_DONE';
    else if (stage === 'FINAL') prog.status = 'COMPLETED';

    prog.lastDate = today;
    saveState();
    
    // 체크 효과를 위해 약간의 지연 후 갱신
    setTimeout(() => {
        renderApp();
        checkAllComplete();
    }, 300);
};

function checkAllComplete() {
    const totalChapters = CHAPTER_DATA.reduce((acc, cat) => acc + cat.subs.length, 0);
    const completedCount = Object.values(state.progress).filter(p => p.status === 'COMPLETED').length;

    if (completedCount === totalChapters) {
        showModal();
    }
}

function showModal() {
    const modal = document.getElementById('modal');
    const msg = document.getElementById('modal-msg');
    msg.innerText = `수학 ${state.cycleCount}바퀴를 모두 돌리셨습니다! 대단한 성과입니다.`;
    modal.classList.remove('hidden');
}

document.getElementById('modal-close').onclick = () => {
    state.cycleCount++;
    state.progress = {}; // 다음 회독을 위해 초기화
    saveState();
    document.getElementById('modal').classList.add('hidden');
    renderApp();
};

// 6. 초기화 및 자정 감시
loadState();
renderApp();

// 페이지가 열려있는 동안 날짜가 바뀌면 자동으로 오늘 할 일을 갱신합니다.
let lastCheckedDate = getTodayString();
setInterval(() => {
    const now = getTodayString();
    if (now !== lastCheckedDate) {
        lastCheckedDate = now;
        renderApp();
    }
}, 60000); // 1분마다 체크
