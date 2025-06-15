// ゲームの状態を管理する変数
let currentStage = 1;
let playerSkills = [];
let availableSkillSlots = 3; // スキル使用回数
let cpuSkills = [];
let cpuSkillUsageCount = 0; // CPUのスキル使用回数（各ステージで3回まで）

// DOM要素の取得
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
const gameArea = document.getElementById('game-area');
const skillSelectionArea = document.getElementById('skill-selection-area');
const skillOptionsDiv = document.getElementById('skill-options');

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

// ゲーム初期化
function initializeGame() {
    currentStage = 1;
    playerSkills = [];
    availableSkillSlots = 3;
    cpuSkills = [];
    cpuSkillUsageCount = 0;
    stageInfo.textContent = `ステージ: ${currentStage}`;
    messageDisplay.textContent = 'じゃんけん…ポン！';
    cpuHandDisplay.textContent = '?';
    playerHandDisplay.textContent = '?';
    resultDisplay.textContent = '';
    updateSkillsDisplay();
    enableJankenButtons(true);
    resetGameBtn.style.display = 'none';
    gameArea.classList.remove('hidden');
    skillSelectionArea.classList.add('hidden');

    // 最初のステージで3つのスキルを付与
    grantInitialSkills();
}

// 最初のステージでスキルを付与する関数
function grantInitialSkills() {
    const selectedSkills = getRandomSkills(3);
    selectedSkills.forEach(skill => playerSkills.push(skill));
    updateSkillsDisplay();
    messageDisplay.textContent = '最初のスキルを獲得しました！じゃんけん…ポン！';
}

// スキル選択画面を表示
function showSkillSelection() {
    gameArea.classList.add('hidden');
    skillSelectionArea.classList.remove('hidden');
    skillOptionsDiv.innerHTML = ''; // 以前の選択肢をクリア

    const randomSkills = getRandomSkills(3);
    randomSkills.forEach(skill => {
        const skillButton = document.createElement('button');
        skillButton.classList.add('skill-option-btn');
        skillButton.textContent = `${skill.name}: ${skill.description}`;
        skillButton.onclick = () => selectSkill(skill);
        skillOptionsDiv.appendChild(skillButton);
    });
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
    gameArea.classList.remove('hidden');
    skillSelectionArea.classList.add('hidden');
    messageDisplay.textContent = `「${skill.name}」を獲得しました！じゃんけん…ポン！`;
    enableJankenButtons(true); // スキル選択後にじゃんけんを再開
}

// 所持スキルの表示を更新
function updateSkillsDisplay() {
    if (playerSkills.length === 0) {
        skillsDisplay.innerHTML = '<p>現在スキルはありません。</p>';
        return;
    }

    skillsDisplay.innerHTML = `使用可能回数: ${availableSkillSlots}<br>`;
    playerSkills.forEach((skill, index) => {
        const skillBtn = document.createElement('button');
        skillBtn.classList.add('player-skill-btn');
        skillBtn.textContent = `${skill.name}`;
        skillBtn.title = skill.description; // ホバーで説明を表示
        skillBtn.onclick = () => useSkill(index);
        skillsDisplay.appendChild(skillBtn);
    });
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

    switch (skill.type) {
        case 'predict':
            // 相手の手を事前に知る（ここではCPUの手を先に決めて表示する）
            const cpuHandIndex = Math.floor(Math.random() * 3);
            cpuHandDisplay.textContent = `相手の手は${hands[cpuHandIndex]}のようです…`;
            cpuHandDisplay.dataset.predictedHand = cpuHandIndex; // データ属性に保存
            messageDisplay.textContent += 'あなたの手を選んでください。';
            usedSkillSuccessfully = true;
            break;
        case 'force_win':
            // 強制勝利フラグをセット
            messageDisplay.textContent += '次の一手でじゃんけんに強制的に勝利します！';
            playerHandDisplay.dataset.forceWin = 'true';
            usedSkillSuccessfully = true;
            break;
        case 're_janken':
            // あいこ無効化フラグをセット
            messageDisplay.textContent += 'あいこになった場合、手を選び直せます。';
            playerHandDisplay.dataset.reJanken = 'true';
            usedSkillSuccessfully = true;
            break;
        case 'disable_cpu_skill':
            messageDisplay.textContent += '相手のスキルを封じました！';
            cpuSkills = []; // CPUスキルを一時的に空にする
            cpuSkillUsageCount = 3; // CPUはもうスキルを使えない
            usedSkillSuccessfully = true;
            break;
        case 'recharge_skill_slot':
            availableSkillSlots++; // スキル使用回数を回復
            messageDisplay.textContent += 'スキル使用回数が1回復しました！';
            usedSkillSuccessfully = true;
            break;
        default:
            messageDisplay.textContent = '不明なスキルです。';
            availableSkillSlots++; // 未知のスキルは使用回数を戻す
            break;
    }

    if (usedSkillSuccessfully) {
        playerSkills.splice(skillIndex, 1); // 使用済みのスキルを削除
    } else {
        availableSkillSlots++; // スキルが使用されなかった場合は戻す
    }
    updateSkillsDisplay();
}

// じゃんけんボタンの有効/無効切り替え
function enableJankenButtons(enable) {
    rockBtn.disabled = !enable;
    scissorsBtn.disabled = !enable;
    paperBtn.disabled = !enable;
}

// じゃんけんの実行
function playJanken(playerChoice) {
    enableJankenButtons(false); // ボタンを無効化して連打を防ぐ

    // CPUの手を決定（スキルで予測されている場合はそれを使う）
    let cpuHandIndex;
    if (cpuHandDisplay.dataset.predictedHand) {
        cpuHandIndex = parseInt(cpuHandDisplay.dataset.predictedHand);
        cpuHandDisplay.dataset.predictedHand = ''; // 使用したらクリア
    } else {
        cpuHandIndex = Math.floor(Math.random() * 3);
    }
    const cpuHand = hands[cpuHandIndex];
    const playerHand = hands[playerChoice];

    // CPUのスキル使用判定（シンプルなロジック）
    let cpuUsedSkill = false;
    if (cpuSkillUsageCount < 3 && Math.random() < 0.3) { // 30%の確率でCPUがスキルを使用
        const availableCpuSkills = allSkills.filter(s => s.type !== 'predict' && s.type !== 'recharge_skill_slot'); // CPUが使わないスキルを除外
        if (availableCpuSkills.length > 0) {
            const cpuSkill = availableCpuSkills[Math.floor(Math.random() * availableCpuSkills.length)];
            messageDisplay.textContent = `CPUが「${cpuSkill.name}」を使用！`;
            cpuUsedSkill = true;
            cpuSkillUsageCount++;

            if (cpuSkill.type === 'force_win') {
                // CPUが強制勝利スキルを使った場合、プレイヤーの手に関わらずCPUが勝つように調整
                const winningHandIndex = (cpuHandIndex + 1) % 3; // CPUの手に対して勝つ手
                playerChoice = winningHandIndex; // プレイヤーの手を負ける手に変更
                messageDisplay.textContent += 'CPUが強制的に勝利します！';
            } else if (cpuSkill.type === 're_janken') {
                // CPUがあいこを無効化する場合
                // あいこになったらCPUの手を再選択するが、このロジックでは複雑になるため、
                // 今回はCPUが強制勝利スキルを使った時のみ考慮する
                messageDisplay.textContent += 'しかし、効果がないようだ…（簡略化のためこのスキルは強制勝利以外は未実装）';
            } else if (cpuSkill.type === 'disable_cpu_skill') {
                 // 相手のスキルを封じるスキルはCPUには実質的に影響なし
                 messageDisplay.textContent += 'CPUは既にスキルを使い切っているか、効果が薄いようだ…。';
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
        playerHandDisplay.dataset.forceWin = ''; // フラグをクリア
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

    // あいこ無効化スキル使用時
    if (draw && playerHandDisplay.dataset.reJanken === 'true') {
        messageDisplay.textContent = 'スキル「あいこを無効化」を発動！手を選び直してください。';
        playerHandDisplay.dataset.reJanken = ''; // フラグをクリア
        enableJankenButtons(true); // もう一度手を選べるようにする
        return; // ゲームの進行を一時停止
    }

    // 勝敗判定後の処理
    setTimeout(() => {
        if (win) {
            messageDisplay.textContent = 'ステージクリア！';
            currentStage++;
            stageInfo.textContent = `ステージ: ${currentStage}`;
            cpuSkillUsageCount = 0; // 次のステージでCPUのスキル使用回数をリセット
            availableSkillSlots = Math.min(3, availableSkillSlots + 1); // 次のステージでスキル使用回数を1回復（最大3）
            updateSkillsDisplay();
            showSkillSelection(); // スキル選択画面へ
        } else if (draw) {
            messageDisplay.textContent = 'あいこ！もう一度！';
            enableJankenButtons(true);
        } else {
            messageDisplay.textContent = 'ゲームオーバー！';
            resetGameBtn.style.display = 'block';
            enableJankenButtons(false);
        }
    }, 1500); // 結果表示後に少し待つ
}

// イベントリスナー
rockBtn.addEventListener('click', () => playJanken(0));
scissorsBtn.addEventListener('click', () => playJanken(1));
paperBtn.addEventListener('click', () => playJanken(2));
resetGameBtn.addEventListener('click', initializeGame);

// ゲーム開始
initializeGame();
