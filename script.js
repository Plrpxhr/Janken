// ゲームの状態を管理する変数
let currentStage = 1;
let playerSkills = [];
let availableSkillSlots = 3; // スキル使用回数
let cpuSkills = []; // 現時点では未使用ですが、今後の拡張のために残しておきます
let cpuSkillUsageCount = 0; // CPUのスキル使用回数（各ステージで3回まで）

// DOM要素の取得
const startScreen = document.getElementById('start-screen');
const rulesScreen = document.getElementById('rules-screen');
const skillListScreen = document.getElementById('skill-list-screen');
const gameArea = document.getElementById('game-area');
const skillSelectionArea = document.getElementById('skill-selection-area');
const initialSkillDisplayScreen = document.getElementById('initial-skill-display-screen');

const startGameBtn = document.getElementById('start-game-btn');
const rulesBtn = document.getElementById('rules-btn');
const skillListBtn = document.getElementById('skill-list-btn');
const backToStartBtnRules = document.getElementById('back-to-start-btn-rules');
const backToStartBtnSkills = document.getElementById('back-to-start-btn-skills');
const startGameFromInitialSkillsBtn = document.getElementById('start-game-from-initial-skills'); // 「じゃんけん開始！」ボタン

const stageInfo = document.getElementById('stage-info');
const messageDisplay = document.getElementById('message');
const cpuHandDisplay = document.getElementById('cpu-hand');
const playerHandDisplay = document.getElementById('player-hand');
const resultDisplay = document.getElementById('result');
const rockBtn = document.getElementById('rock');
const scissorsBtn = document.getElementById('scissors');
const paperBtn = document.getElementById('paper');
const skillsDisplay = document.getElementById('skills-display');
const resetGameBtn = document.getElementById('reset-game');
const skillOptionsDiv = document.getElementById('skill-options');
const allSkillsDisplay = document.getElementById('all-skills-display'); // スキルリスト表示用
const initialSkillsList = document.getElementById('initial-skills-list'); // 最初のスキル表示用

// じゃんけんの手
const hands = ['グー', 'チョキ', 'パー'];

// スキル定義
const allSkills = [
    { name: '相手の手を予測', description: '次の相手の手を事前に知ることができる。', type: 'predict', effect: null },
    { name: '強制的に勝利', description: '一度だけじゃんけんに強制的に勝利できる。', type: 'force_win', effect: null },
    { name: 'あいこを無効化', description: 'あいこになった場合、自分の手を変えて再勝負できる。', type: 're_janken', effect: null },
    { name: 'スキル封じ', description: '相手のスキルを一時的に使用不可にする。', type: 'disable_cpu_skill', effect: null },
    { name: 'スキルチャージ', description: 'スキル使用回数を1回復する。', type: 'recharge_skill_slot', effect: null },
];

// 画面表示を切り替える汎用関数
function showScreen(screenToShow) {
    const screens = [startScreen, rulesScreen, skillListScreen, gameArea, skillSelectionArea, initialSkillDisplayScreen];
    screens.forEach(screen => {
        if (screen === screenToShow) {
            screen.classList.remove('hidden');
            // デバッグ用: どの画面が表示されたかコンソールに出力
            console.log(`画面表示: ${screen.id}`);
        } else {
            screen.classList.add('hidden');
        }
    });
}

// ゲームの状態をリセットし、最初のスキルを付与
function setupNewGame() {
    currentStage = 1;
    playerSkills = [];
    availableSkillSlots = 3;
    cpuSkills = []; // CPUスキルをクリア
    cpuSkillUsageCount = 0;
    stageInfo.textContent = `ステージ: ${currentStage}`;
    messageDisplay.textContent = 'じゃんけん…ポン！';
    cpuHandDisplay.textContent = '?';
    playerHandDisplay.textContent = '?';
    resultDisplay.textContent = '';
    resetGameBtn.style.display = 'none'; // リセットボタンを非表示にする

    // 最初のステージで3つのスキルを付与
    const grantedSkills = getRandomSkills(3);
    grantedSkills.forEach(skill => playerSkills.push(skill));

    // 所持スキル表示を更新
    updateSkillsDisplay();
    // 獲得スキルを表示する画面へ
    displayInitialSkills(grantedSkills);

    // この時点ではじゃんけんボタンは無効のまま
    enableJankenButtons(false);
    console.log("setupNewGame: じゃんけんボタンを無効化");
}

// 獲得した最初のスキルを表示
function displayInitialSkills(skills) {
    initialSkillsList.innerHTML = '';
    if (skills.length === 0) {
        initialSkillsList.innerHTML = '<li>スキルが何も獲得できませんでした。</li>'; // スキルがない場合も考慮
    } else {
        skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = `${skill.name}: ${skill.description}`;
            initialSkillsList.appendChild(li);
        });
    }
    showScreen(initialSkillDisplayScreen); // 最初のスキル確認画面を表示
}

// スキル選択画面を表示
function showSkillSelection() {
    showScreen(skillSelectionArea);
    skillOptionsDiv.innerHTML = ''; // 以前の選択肢をクリア

    const randomSkills = getRandomSkills(3);
    randomSkills.forEach(skill => {
        const skillButton = document.createElement('button');
        skillButton.classList.add('skill-option-btn');
        skillButton.textContent = `${skill.name}: ${skill.description}`;
        skillButton.onclick = () => selectSkill(skill);
        skillOptionsDiv.appendChild(skillButton);
    });
    // スキル選択中はじゃんけんボタンを無効化
    enableJankenButtons(false);
    console.log("showSkillSelection: じゃんけんボタンを無効化");
}

// ランダムなスキルを取得
function getRandomSkills(count) {
    const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// スキルを選択して取得
function selectSkill(skill) {
    playerSkills.push(skill);
    updateSkillsDisplay();
    showScreen(gameArea); // ゲーム画面に戻る
    messageDisplay.textContent = `「${skill.name}」を獲得しました！じゃんけん…ポン！`;
    // スキル選択後にじゃんけんボタンを有効化
    enableJankenButtons(true);
    console.log("selectSkill: じゃんけんボタンを有効化");
}

// 所持スキルの表示を更新
function updateSkillsDisplay() {
    // 既存のスキル表示をクリア
    skillsDisplay.innerHTML = '';

    const skillCounterP = document.createElement('p');
    skillCounterP.textContent = `使用可能回数: ${availableSkillSlots}`;
    skillsDisplay.appendChild(skillCounterP);

    // スキルボタンのコンテナを作成または取得
    let skillButtonsContainer = document.getElementById('skill-buttons-container');
    if (!skillButtonsContainer) {
        skillButtonsContainer = document.createElement('div');
        skillButtonsContainer.id = 'skill-buttons-container';
        skillsDisplay.appendChild(skillButtonsContainer);
    }
    skillButtonsContainer.innerHTML = ''; // コンテナの中身をクリア

    if (playerSkills.length === 0) {
        const noSkillP = document.createElement('p');
        noSkillP.textContent = '現在スキルはありません。';
        skillButtonsContainer.appendChild(noSkillP);
        return;
    }

    playerSkills.forEach((skill, index) => {
        const skillBtn = document.createElement('button');
        skillBtn.classList.add('player-skill-btn');
        skillBtn.textContent = `${skill.name}`;
        skillBtn.title = skill.description; // ホバーで説明を表示
        skillBtn.onclick = () => useSkill(index);
        skillButtonsContainer.appendChild(skillBtn);
    });
    console.log("updateSkillsDisplay: プレイヤーのスキルを更新しました。", playerSkills);
}

// スキルの使用
async function useSkill(skillIndex) {
    if (availableSkillSlots <= 0) {
        messageDisplay.textContent = 'スキル使用回数がありません！';
        return;
    }

    const skill = playerSkills[skillIndex];
    if (!skill) return;

    messageDisplay.textContent = `「${skill.name}」を使用！`;
    availableSkillSlots--; // 使用回数を減らす

    let usedSkillSuccessfully = false;

    // スキル使用中はじゃんけんボタンを一時的に無効化
    enableJankenButtons(false);
    console.log("useSkill: スキル使用中、じゃんけんボタンを無効化");

    // 一時的にスキルボタンを無効化
    const skillButtons = document.querySelectorAll('.player-skill-btn');
    skillButtons.forEach(btn => btn.disabled = true);

    await new Promise(resolve => setTimeout(resolve, 500)); // スキルメッセージ表示のための短い遅延

    switch (skill.type) {
        case 'predict':
            const cpuHandIndex = Math.floor(Math.random() * 3);
            cpuHandDisplay.textContent = `相手の手は${hands[cpuHandIndex]}のようです…`;
            cpuHandDisplay.dataset.predictedHand = cpuHandIndex;
            messageDisplay.textContent += 'あなたの手を選んでください。';
            usedSkillSuccessfully = true;
            break;
        case 'force_win':
            messageDisplay.textContent += '次の一手でじゃんけんに強制的に勝利します！';
            playerHandDisplay.dataset.forceWin = 'true';
            usedSkillSuccessfully = true;
            break;
        case 're_janken':
            messageDisplay.textContent += 'あいこになった場合、手を選び直せます。';
            playerHandDisplay.dataset.reJanken = 'true';
            usedSkillSuccessfully = true;
            break;
        case 'disable_cpu_skill':
            messageDisplay.textContent += '相手のスキルを封じました！';
            cpuSkills = []; // CPUスキルを空にする
            cpuSkillUsageCount = 3; // CPUのスキル使用回数を上限に設定し、使えないようにする
            usedSkillSuccessfully = true;
            break;
        case 'recharge_skill_slot':
            availableSkillSlots++;
            messageDisplay.textContent += 'スキル使用回数が1回復しました！';
            usedSkillSuccessfully = true;
            break;
        default:
            messageDisplay.textContent = '不明なスキルです。';
            availableSkillSlots++; // 使用回数を元に戻す
            break;
    }

    if (usedSkillSuccessfully) {
        if (skill.type !== 'recharge_skill_slot') {
            playerSkills.splice(skillIndex, 1); // スキルチャージ以外は削除
        }
    } else {
        availableSkillSlots++; // 失敗したら使用回数を元に戻す
    }
    updateSkillsDisplay();

    // スキル使用後、じゃんけんボタンを有効化
    enableJankenButtons(true);
    console.log("useSkill: スキル使用後、じゃんけんボタンを有効化");

    // スキルボタンも有効化
    skillButtons.forEach(btn => btn.disabled = false);
}

// じゃんけんボタンの有効/無効切り替え
function enableJankenButtons(enable) {
    rockBtn.disabled = !enable;
    scissorsBtn.disabled = !enable;
    paperBtn.disabled = !enable;
    console.log(`じゃんけんボタンの状態: グー-${rockBtn.disabled ? '無効' : '有効'}, チョキ-${scissorsBtn.disabled ? '無効' : '有効'}, パー-${paperBtn.disabled ? '無効' : '有効'}`);
}

// じゃんけんの実行
function playJanken(playerChoice) {
    enableJankenButtons(false); // ボタンを無効化して連打を防ぐ
    console.log("playJanken: じゃんけんボタンを無効化");

    // CPUの手を決定（スキルで予測されている場合はそれを使う）
    let cpuHandIndex;
    if (cpuHandDisplay.dataset.predictedHand) {
        cpuHandIndex = parseInt(cpuHandDisplay.dataset.predictedHand, 10);
        cpuHandDisplay.dataset.predictedHand = ''; // 使用後はクリア
    } else {
        cpuHandIndex = Math.floor(Math.random() * 3);
    }
    const cpuHand = hands[cpuHandIndex];
    const playerHand = hands[playerChoice];

    // CPUのスキル使用判定（シンプルなロジック）
    let cpuUsedSkill = false;
    if (cpuSkillUsageCount < 3 && Math.random() < 0.3) {
        // disable_cpu_skill でCPUスキルが封じられている場合はスキップ
        const canUseCpuSkill = allSkills.filter(s => s.type === 'force_win' || s.type === 're_janken'); // CPUが使用可能なスキルを限定
        if (canUseCpuSkill.length > 0) {
            const cpuSkill = canUseCpuSkill[Math.floor(Math.random() * canUseCpuSkill.length)];
            messageDisplay.textContent = `CPUが「${cpuSkill.name}」を使用！`;
            cpuUsedSkill = true;
            cpuSkillUsageCount++;

            if (cpuSkill.type === 'force_win') {
                // CPUが勝つようにプレイヤーの手を操作 (CPUの手 + 1 % 3)
                playerChoice = (cpuHandIndex + 2) % 3; // 修正: プレイヤーがCPUに負けるように手を変える
                messageDisplay.textContent += 'CPUが強制的に勝利します！';
            } else if (cpuSkill.type === 're_janken') {
                // CPUのあいこを無効化 (今回は簡略化のためプレイヤーのあいこ無効化と同様の挙動)
                // 実際にはCPUが手を変えるロジックを実装する
                messageDisplay.textContent += 'CPUがあいこを無効化しました！';
            }
        }
    }

    cpuHandDisplay.textContent = cpuHand;
    playerHandDisplay.textContent = playerHand;

    let result = '';
    let win = false;
    let draw = false;

    // プレイヤーの強制勝利スキル適用
    if (playerHandDisplay.dataset.forceWin === 'true') {
        result = 'あなたの勝利！';
        win = true;
        playerHandDisplay.dataset.forceWin = ''; // 使用後はクリア
    } else {
        if (playerChoice === cpuHandIndex) {
            result = 'あいこ！';
            draw = true;
        } else if (
            (playerChoice === 0 && cpuHandIndex === 1) || // グー vs チョキ
            (playerChoice === 1 && cpuHandIndex === 2) || // チョキ vs パー
            (playerChoice === 2 && cpuHandIndex === 0)    // パー vs グー
        ) {
            result = 'あなたの勝利！';
            win = true;
        } else {
            result = '相手の勝利！';
            win = false;
        }
    }

    resultDisplay.textContent = result;

    // あいこ無効化スキル使用時 (プレイヤー側)
    if (draw && playerHandDisplay.dataset.reJanken === 'true') {
        messageDisplay.textContent = 'スキル「あいこを無効化」を発動！手を選び直してください。';
        playerHandDisplay.dataset.reJanken = ''; // 使用後はクリア
        enableJankenButtons(true); // もう一度手を選べるようにする
        console.log("playJanken: あいこ無効化スキル発動、じゃんけんボタンを有効化");
        return; // ここで処理を中断し、次のじゃんけんを待つ
    }

    // 勝敗判定後の処理
    setTimeout(() => {
        if (win) {
            messageDisplay.textContent = 'ステージクリア！';
            currentStage++;
            stageInfo.textContent = `ステージ: ${currentStage}`;
            cpuSkillUsageCount = 0; // CPUのスキル使用回数をリセット
            availableSkillSlots = Math.min(3, availableSkillSlots + 1); // スキル使用回数を1回復（最大3）
            updateSkillsDisplay();
            showSkillSelection(); // スキル選択画面へ
        } else if (draw) {
            messageDisplay.textContent = 'あいこ！もう一度！';
            enableJankenButtons(true);
            console.log("playJanken: あいこ、じゃんけんボタンを有効化");
        } else {
            messageDisplay.textContent = 'ゲームオーバー！';
            resetGameBtn.style.display = 'block';
            enableJankenButtons(false); // ゲームオーバーでじゃんけんボタン無効化
            console.log("playJanken: ゲームオーバー、じゃんけんボタンを無効化");
        }
    }, 1500); // 結果表示後に少し待つ
}

// スキルリストを表示する関数
function displayAllSkills() {
    allSkillsDisplay.innerHTML = '';
    allSkills.forEach(skill => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${skill.name}</strong>: ${skill.description}`;
        allSkillsDisplay.appendChild(p);
    });
}

// イベントリスナー
startGameBtn.addEventListener('click', () => {
    console.log("「ゲーム開始」ボタンがクリックされました。");
    setupNewGame();
});

rulesBtn.addEventListener('click', () => {
    console.log("「ルール」ボタンがクリックされました。");
    showScreen(rulesScreen);
});
skillListBtn.addEventListener('click', () => {
    console.log("「スキルリスト」ボタンがクリックされました。");
    displayAllSkills();
    showScreen(skillListScreen);
});

backToStartBtnRules.addEventListener('click', () => {
    console.log("ルール画面からスタート画面に戻ります。");
    showScreen(startScreen);
});
backToStartBtnSkills.addEventListener('click', () => {
    console.log("スキルリスト画面からスタート画面に戻ります。");
    showScreen(startScreen);
});

// 最初のスキル確認後、「じゃんけん開始！」ボタンでゲーム本編を開始
startGameFromInitialSkillsBtn.addEventListener('click', () => {
    console.log("「じゃんけん開始！」ボタンがクリックされました。");
    showScreen(gameArea); // ゲーム本体の画面を表示
    messageDisplay.textContent = 'じゃんけん…ポン！';
    cpuHandDisplay.textContent = '?';
    playerHandDisplay.textContent = '?';
    resultDisplay.textContent = '';
    // ここでじゃんけんボタンを有効化することが重要
    enableJankenButtons(true);
    console.log("ゲーム開始後、じゃんけんボタンを有効化しました。");
});

// ゲームオーバー後のリセットボタン
resetGameBtn.addEventListener('click', () => {
    console.log("「ゲームをリセット」ボタンがクリックされました。");
    showScreen(startScreen); // リセットボタンでスタート画面に戻る
    // リセット時にじゃんけんボタンは無効のまま
    enableJankenButtons(false);
    resetGameBtn.style.display = 'none'; // リセットボタンを非表示にする
});

// じゃんけんボタンにイベントリスナーを追加
rockBtn.addEventListener('click', () => playJanken(0));
scissorsBtn.addEventListener('click', () => playJanken(1));
paperBtn.addEventListener('click', () => playJanken(2));


// 最初にスタート画面を表示
showScreen(startScreen);
// 初期表示でじゃんけんボタンは無効にしておく
enableJankenButtons(false);
console.log("初期表示: じゃんけんボタンを無効化しました。");
