let capture;
let w = 1920, h = 1080
let waiting = false
let handPose;
let hands = [];
let isDetecting = false;

let photo
let scl
let points = [0, 1, 2, 5, 9, 13, 17]
let targets = []
let targetSize = 180
let startTime, score = 0;
let gameState = true
let currentIndex = 0;
let send = false
let word = "According to the actions of the characters in the figure and the scores in the upper right corner, generate a humorous word of encouragement, and then say a word of encouragement to the characters' next work"

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function encodeImg(img) {
  let copy = img.get()
  copy.loadPixels();
  return copy.canvas.toDataURL("image/jpeg");
}

function setup() {
  createCanvas(windowWidth, windowHeight)


  capture = createCapture(VIDEO);
  capture.size(1280, 960)
  capture.hide();
  textSize(20);
  handPose.detectStart(capture, gotHands);
  w = capture.width
  h = capture.height
  scl = height / h
  setTarget()
  startTime = millis();

}

let aiResult = "";
function draw() {
  background(220);
  if (gameState) {
    game()
  } else {
    end()
  }
}
function end() {
  background(220)
  imageMode(CENTER)
  image(photo, width * 0.25, height * 0.5, photo.width * 0.5, photo.height * 0.5)
  textAlign(RIGHT, CENTER)
  fill(0)
  text("score: " + score, width / 2 + w / 2 * scl - 30, 70)
  textAlign(LEFT, TOP)
  rectMode(CENTER)
  fill(0)
  textSize(50)
  text(aiResult, width * 0.7, height * 0.5, width * 0.3, height * 0.5)
  backButton()
}
let bx, by, bw, bh
function backButton() {
  bx = width * 0.8
  by = height * 0.75
  bw = 160
  bh = 80
  push();
  fill(0, 100)
  if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
    fill(0, 150)
    if (mouseIsPressed) {
      currentIndex = 0;
      send = false
      shuffleTarget()
      startTime = millis()
      gameState = true
      score = 0
    }
  }
  textAlign(CENTER, CENTER)
  rect(bx, by, bw, bh, 5)
  fill(0)
  textSize(bh * 0.5)
  text("BACK", bx, by)
  pop()
}
function game() {
  push()
  imageMode(CENTER)
  translate(width / 2, height / 2)
  scale(scl)
  scale(-1, 1)
  image(capture, 0, 0)
  pop()
  push()
  imageMode(CENTER)

  for (let i = 0; i < hands.length; i++) {

    let hand = hands[i];
    let sumX = 0, sumY = 0
    for (let j = 0; j < points.length; j++) {
      let keypoint = hand.keypoints[points[j]];
      let x = map(keypoint.x, w, 0, width / 2 - w * scl / 2, width / 2 + w * scl / 2)
      let y = map(keypoint.y, 0, h, height / 2 - h * scl / 2, height / 2 + h * scl / 2)
      sumX += x
      sumY += y
    }
    sumX /= points.length
    sumY /= points.length
    fill(240, 50, 50)
    noStroke()
    circle(sumX, sumY, targetSize * 0.7);
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].collision(sumX, sumY)) {
        score += 10
      }
    }
  }
  pop()
  for (let i = 0; i < targets.length; i++) {
    targets[i].display()
  }
  fill(0, 100)
  rectMode(CENTER)
  noStroke();
  rect(150, 70, 160, 90)
  let t = millis() - startTime
  t /= 1000
  t = int(30 - t)
  textSize(60)
  fill(255)
  textAlign(CENTER, CENTER)

  text(t, 150, 75)
  textAlign(RIGHT)
  text("score: " + score, width / 2 + w / 2 * scl - 30, 70)
  if (!send && t == 15) {
    photo = get(width / 2 - w / 2 * scl, height / 2 - h / 2 * scl, w * scl, h * scl)
    send = true
    sendPhoto()
  }

  if (currentIndex == targets.length) {
    shuffleTarget()
  }
  if (t <= 0) {
    gameState = false
  }
}
function gotHands(results) {
  hands = results;
}
let posXList = []
let posYList = []
function setTarget() {
  let wid = 0.4, hei = 0.45
  angleMode(DEGREES)
  for (let i = 0; i < 5; i++) {
    let a1 = map(i, 0, 4, -45, 45)
    let x1 = cos(a1) * w * scl * wid
    let y1 = sin(a1) * h * scl * hei
    let a2 = a1 + 180
    let x2 = cos(a2) * w * scl * wid
    let y2 = sin(a2) * h * scl * hei
    posXList.push(x1)
    posXList.push(x2)
    posYList.push(y1)
    posYList.push(y2)
  }
  shuffleTarget()
}
function shuffleTarget() {
  currentIndex = 0;

  let indexs = []
  targets = []
  for (let i = 0; i < 10; i++) {
    indexs.push(i)
  }
  indexs = shuffle(indexs)
  for (let i = 0; i < 10; i++) {
    targets.push(new Target(posXList[i], posYList[i], indexs[i]))
  }
}
class Target {
  constructor(x, y, index) {
    this.x = x + width / 2
    this.y = y + height / 2
    this.index = index
    this.show = true
  }
  display() {
    if (this.show) {
      noStroke()
      fill(10,232,246)
      ellipse(this.x, this.y, targetSize)
      fill(255)
      textSize(targetSize * 0.3)
      textAlign(CENTER, CENTER)
      fill(0)
      stroke(255)
      text(this.index + 1, this.x, this.y + targetSize * 0.03)
    }
  }
  collision(x, y) {
    if (currentIndex == this.index && this.show && dist(x, y, this.x, this.y) < targetSize / 2) {
      this.show = false
      currentIndex++
      return true
    }
    return false

  }
}
async function sendPhoto() {
  let mMessages = [{
    role: "user",
    content: [
      { type: "text", text: word },

      { type: "image_url", image_url: { url: encodeImg(capture) } },
    ],
  }];
  aiResult = await qwenchatCompletion(mMessages);
  print(aiResult)
}