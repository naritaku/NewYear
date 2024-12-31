let demoSnake, playerSnake, cpuSnake;
let fruits = [];
const segmentSize = 20; // セグメントのサイズ
const numFruits = 5; // フルーツの数
const gameDuration = 30 * 1000; // ゲーム時間（30秒）
const baseSnakeSpeed = 5;
const backgroundColor = '#1c1a1a'
let startTime;
let gameState = "start"; // ゲームの状態を管理（"start" または "playing"）

const strategies = [closestFruitStrategy, avoidPlayerFruitStrategy, shortestTwoFruitStrategy]; // 利用可能なストラテジー
const message = [
    "いいとしになりますように",
    "あなたの願いが叶いますように",
    "幸運が続きますように",
    "新しい挑戦が実を結びますように",
    "笑顔あふれる一年をお過ごしください",
    "周りの人と幸せを分かち合えますように",
    "健康と幸せが訪れますように",
    "新しい出会いに恵まれますように",
    "努力が実り大きな成果を得られますように",
    "素敵な瞬間をたくさん楽しめますように"
]
function setup() {
    createCanvas(windowWidth, windowHeight);

    // フルーツを１つだけ出しておく
    fruits.push(new Fruit());
    demoSnake = new Snake(width / 4, height / 4, color(48, 105, 152), closestFruitStrategy);

    // プレイヤーとCPUのヘビを初期化（作戦を注入）
    playerSnake = new Snake(width / 4, height / 2, color(48, 105, 152), mouseStrategy);
    const randomStrategy = random(strategies); // CPUのストラテジーをランダムで選択
    cpuSnake = new Snake((width * 3) / 4, height / 2, color(255, 212, 59), randomStrategy);

    startTime = millis(); // ゲーム開始時間を記録
}

function draw() {
    background(backgroundColor);

    // フルーツを描画
    for (let fruit of fruits) {
        fruit.draw();
    }

    if (gameState === "start") {
        demoSnake.update();
        demoSnake.draw();

        displayStartScreen(); // スタート画面を表示
        return;
    }

    // ゲーム中の処理
    const elapsedTime = millis() - startTime;
    if (elapsedTime >= gameDuration) {
        background(backgroundColor);
        noLoop(); // ゲームを終了
        displayResult();
        return;
    }

    // プレイヤーとCPUの動作
    playerSnake.update();
    cpuSnake.update();

    playerSnake.draw();
    cpuSnake.draw();

    // 残り時間を表示
    displayTimer(gameDuration - elapsedTime);
}

function displayStartScreen() {
    // 文字部分の背景
    fill(backgroundColor + '80'); // 透明度が 128/255
    rect(0, height / 2 - 48, width, height / 4 + 84)
    //メッセージ
    textSize(128);
    fill(255);
    textAlign(CENTER, CENTER);
    text("🎍", width / 2, height / 3);
    fitText(32, "明けましておめでとうございます\n今年もよろしくお願いします", width / 2, height / 2);
    fitText(18, "巳年なのでヘビゲームを作ってみました。\n青いヘビはタップした場所を目指します。りんごを集めてください。\n1回30秒で最後におみくじが出ます。\nもしよろしければお試しください。", width / 2, height * 0.625);
    fill(255, 128 + 128 * sin(millis() / 500));
    fitText(18, "Tap to Start", width / 2, height * 0.75);
}

// 画面幅に収まるように
function fitText(maxTextSize, mes, x, y) {
    //[TODO] 等幅フォントでないとダメ
    const longestLine = mes.split('\n').reduce((longest, current) =>
        current.length > longest.length ? current : longest, ""
    );
    do {
        textSize(maxTextSize--);
    } while (textWidth(longestLine) >= width && maxTextSize > 0);
    text(mes, x, y);
}

function mousePressed() {
    if (gameState === "start") {
        for (let i = fruits.length; i < numFruits; i++) {
            fruits.push(new Fruit());
        }
        gameState = "playing"; // ゲーム状態を開始に変更
        startTime = millis(); // ゲーム開始時間を記録
        loop(); // ゲームを開始
    }
}

function displayResult() {
    fill(255);
    textAlign(CENTER, CENTER);

    const snake = Array.from(
        "🐍".repeat([
            playerSnake.score > cpuSnake.score,
            playerSnake.isSerpentined,
            playerSnake.isCoiled
        ].filter(Boolean).length) + "🥚🥚🥚"
    ).slice(0, 3).join("");

    const urlParams = new URLSearchParams(window.location.search);

    // luck パラメータの値を取得
    const luckValue = urlParams.get("luck");
    let luck = random(["大吉", "中吉", "小吉", "吉", "末吉"]);
    // 判定
    if (luckValue === "大吉") {
        luck = "大吉 !"
    }

    fitText(32, `score: ${playerSnake.score}\n🐍らしさ: ${snake}\n運勢: ${luck}`, width * 0.5, height * 0.5);
    fitText(20, `${random(message)}`, width * 0.5, height * 0.75);

}

// 残り時間を表示
function displayTimer(remainingTime) {
    textSize(16);
    fill(255);
    textAlign(LEFT, TOP);
    text(`Time: ${(remainingTime / 1000).toFixed(1)}s`, 10, 10);
    text(`Player: ${playerSnake.score}`, 10, 30);
    text(`CPU: ${cpuSnake.score}`, 10, 50);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Fruit {
    constructor() {
        this.x;
        this.y;
        this.respawn();
        this.radius = segmentSize;
    }
    draw() {
        // 果実部分
        fill(217, 51, 63);
        ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
        // ヘタ部分
        stroke("#290d0b");
        strokeWeight(2);
        line(this.x, this.y - this.radius * 0.8, this.x + this.radius * 0.1, this.y - this.radius * 1.2)
        noStroke();
    }
    respawn() {
        this.x = (random(0.8) + 0.1) * width;
        this.y = (random(0.8) + 0.1) * height;
    }

    isEaten(head) {
        return dist(head.x, head.y, this.x, this.y) < this.radius
    }

}

// Snakeクラス定義
class Snake {
    constructor(x, y, color, strategy) {
        this.body = [createVector(x, y)];
        this.bodySize = segmentSize
        this.angle = 0;
        this.limitAngle = 10 / 180 * PI; //10 [deg]
        this.numSegments = 10;
        this.color = color;
        this.strategy = strategy; // 作戦を保持
        this.score = 0; // フルーツを取得した数
        this.headSpeed = baseSnakeSpeed; // ヘビの速度
        this.isCoiled = false
        this.isSerpentined = false
    }

    // ヘビを更新する
    update() {
        const head = this.body[0]
        const target = this.strategy(head, fruits, playerSnake); // 作戦に従って目標を取得
        let targetAngle = atan2(target.y - head.y, target.x - head.x);
        let angleDiff = targetAngle - this.angle;

        // 角度を±10度に制限
        angleDiff = atan2(sin(angleDiff), cos(angleDiff));
        angleDiff = constrain(angleDiff, -1 * this.limitAngle, this.limitAngle);

        // 現在の角度を更新
        this.angle += angleDiff;

        // 新しい頭の位置を計算
        let newHead = head.copy();
        newHead.x += cos(this.angle) * this.headSpeed;
        newHead.y += sin(this.angle) * this.headSpeed;

        // キャンバス内に制限
        newHead.x = constrain(newHead.x, 0, width - segmentSize);
        newHead.y = constrain(newHead.y, 0, height - segmentSize);

        // 新しい位置をヘビの先頭に追加
        this.body.unshift(newHead);

        // フルーツを食べたか確認
        for (let i = 0; i < fruits.length; i++) {
            if (fruits[i].isEaten(newHead)) {
                fruits[i].respawn();
                this.numSegments++; // ヘビを成長させる
                this.score++; // スコアを加算
            }
        }

        // 蛇っぽいと加速
        if (this.isSerpentine() || this.isCoiling()) {
            if (this.headSpeed <= baseSnakeSpeed) {
                this.headSpeed = baseSnakeSpeed * 1.25
                setTimeout(() => this.setDefaultSpeed(), 3000);
            }
        }

        // ヘビの長さを維持
        if (this.body.length > this.numSegments) {
            this.body.pop();
        }
    }

    setDefaultSpeed() {
        this.headSpeed = baseSnakeSpeed
    }
    // ヘビを描画する
    draw() {
        if (this.isSerpentine()) {
            strokeWeight(segmentSize * 2.5)
            for (let i = 1; i < this.body.length; i++) {

                let hueValue = map(i, 0, this.body.length, 0, 360); // セグメントのインデックスを色相にマッピング
                stroke(color(`hsl(${hueValue}, 100%, 50%)`)); // HSLで虹色を設定
                line(this.body[i - 1].x, this.body[i - 1].y, this.body[i].x, this.body[i].y)
            }
            noStroke();
        }
        if (this.isCoiling()) {
            stroke("#FFFFFF7F");
            strokeWeight(segmentSize * 1.5)
            for (let i = 1; i < this.body.length; i++) {
                line(this.body[i - 1].x, this.body[i - 1].y, this.body[i].x, this.body[i].y)
            }
            noStroke();
        }
        fill(this.color);
        noStroke();
        for (let segment of this.body) {
            ellipse(segment.x, segment.y, segmentSize, segmentSize);
        }
    }

    // トグロを巻いているか
    isCoiling() {
        // 判定できない長さなら即false
        if (this.body.length < 3) {
            return false;
        }

        let prevVec = p5.Vector.sub(this.body[1], this.body[0]).normalize();
        // 正規化できない場合はそのままのベクトルが返ってくるので即false
        if (prevVec.mag() === 0) {
            return false
        }
        for (let i = 2; i < this.body.length; i++) {
            // 直前の胴体との角度差を求める
            let currVec = p5.Vector.sub(this.body[i], this.body[i - 1]).normalize();
            if (currVec.mag() === 0) {
                return false
            }
            const theta = acos(constrain(prevVec.dot(currVec), -1, 1));
            // 角度差が小さい場合、トグロを巻いていないと判定
            if (theta < 0.9 * this.limitAngle) {
                return false;
            }
            prevVec = currVec;
        }
        // 全ての角度が許容範囲内ならトグロを巻いている
        this.isCoiled = true
        return true;
    }

    // 蛇行しているか
    isSerpentine() {
        // 判定できない長さなら即false
        if (this.body.length < 3) {
            return false;
        }
        // 尻尾から頭にかけてのベクトル
        const v1 = p5.Vector.sub(this.body[0], this.body[this.body.length - 1])
        // 外積の最大、最小値からv1ベクトルからの垂直な距離が最も離れた距離を探す
        let min = 0
        let max = 0
        for (let i = 1; i < this.body.length - 1; i++) {
            // 各胴体から頭にかけてのベクトル
            const v2 = p5.Vector.sub(this.body[0], this.body[i])
            const cross = v1.x * v2.y - v1.y * v2.x;
            if (cross > max) { max = cross; }
            if (cross < min) { min = cross; }
        }
        // 線分の両側に垂直方向に頭半分以上の距離が離れた胴体があればS時とする
        if (min / v1.mag() < -0.5 * this.bodySize && max / v1.mag() > 0.5 * this.bodySize) {
            this.isSerpentined = true
            return true
        }
        return false
    }

}


// 作戦: マウスを追いかける
function mouseStrategy(head, fruits) {
    return createVector(mouseX, mouseY); // マウスの位置を目標とする
}

// 作戦: 最も近いフルーツを追いかける
function closestFruitStrategy(head, fruits) {
    let closest = fruits[0];
    let minDist = dist(head.x, head.y, closest.x, closest.y);
    for (let fruit of fruits) {
        let d = dist(head.x, head.y, fruit.x, fruit.y);
        if (d < minDist) {
            closest = fruit;
            minDist = d;
        }
    }
    return closest;
}

// 作戦: プレイヤーが近いフルーツを避ける
function avoidPlayerFruitStrategy(head, fruits, player) {
    if (player.body === undefined || player.body[0] === undefined) {
        return fruits[0];
    }
    const playerHead = player.body[0]
    let bestFruit = fruits[0];
    let maxDistDifference = -Infinity;

    for (let fruit of fruits) {
        const distToCpu = dist(head.x, head.y, fruit.x, fruit.y);
        const distToPlayer = dist(playerHead.x, playerHead.y, fruit.x, fruit.y);

        // プレイヤーが遠く、CPUが近いフルーツを優先
        const distDifference = distToPlayer - distToCpu;

        if (distDifference > maxDistDifference) {
            maxDistDifference = distDifference;
            bestFruit = fruit;
        }
    }

    return bestFruit;
}

// 作戦: 2つのフルーツを取得する最小コスト経路
function shortestTwoFruitStrategy(head, fruits) {
    function getDistance(pointA, pointB) {
        return dist(pointA.x, pointA.y, pointB.x, pointB.y);
    }

    let bestPair = null;
    let minCost = Infinity;

    for (let i = 1; i < fruits.length; i++) {
        for (let j = 0; j < i; j++) {
            const pairDist = getDistance(fruits[i], fruits[j]);
            const cost1 = getDistance(head, fruits[i]) + pairDist;
            const cost2 = getDistance(head, fruits[j]) + pairDist;
            if (cost1 < minCost) {
                minCost = cost1;
                bestPair = fruits[i];
            }
            if (cost2 < minCost) {
                minCost = cost2;
                bestPair = fruits[j];
            }
        }
    }

    return bestPair || fruits[0];
}
