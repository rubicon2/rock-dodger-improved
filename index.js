/**
 * Don't change these constants!
 */
const DODGER = document.getElementById('dodger')
const GAME = document.getElementById('game')
const SCORE = document.getElementById("score"); 
const GAME_HEIGHT = 400
const GAME_WIDTH = 400
const LEFT_ARROW = 37
const RIGHT_ARROW = 39
const ROCKS = []
const START = document.getElementById('start')

var gameInterval = null
var rockCountdown = null;

var scoreCounter = 0; 
var maxScore = 10000;
var rockMinSpeed = 2;
var rockMaxSpeed = 10;
var currentRockSpeed = rockMinSpeed;

var leftDown = false;
var rightDown = false;
var isMoving = false;
var dodgerSpeed = 4;

function checkCollision(rock) {

  const top = positionToInteger(rock.style.top)

  // rocks are 20px high
  // DODGER is 20px high
  // GAME_HEIGHT - 20 - 20 = 360px;

  // If the rock has reached the dodger at the bottom of the screen, then check the x for collision. 
  if (top > 360) {

    const dodgerLeftEdge = positionToInteger(DODGER.style.left)
    const dodgerRightEdge = dodgerLeftEdge + 40;
    const rockLeftEdge = positionToInteger(rock.style.left)
    const rockRightEdge = rockLeftEdge + 20;

    
    if (rockLeftEdge <= dodgerLeftEdge && rockRightEdge >= dodgerLeftEdge) {
      return true;
    } else if (rockLeftEdge >= dodgerLeftEdge && rockRightEdge <= dodgerRightEdge) {
      return true; 
    } else if (rockLeftEdge <= dodgerRightEdge && rockRightEdge >= dodgerRightEdge) {
      return true;
    }    
  }
}

function createRock(x) {

  const rock = document.createElement('div')

  rock.className = 'rock'
  rock.style.left = `${x}px`

  // Hmmm, why would we have used `var` here?
  var top = 0

  rock.style.top = top

  /**
   * Now that we have a rock, we'll need to append
   * it to GAME and move it downwards.
   */
  GAME.appendChild(rock);

  /**
   * This function moves the rock. (2 pixels at a time
   * seems like a good pace.)
   */
  function moveRock() {

    currentRockSpeed = lerpUnclamped(rockMinSpeed, rockMaxSpeed, scoreCounter / maxScore); 
    rock.style.top = `${top += currentRockSpeed}px`;

    if (checkCollision(rock)) {
      return endGame(); 
    }

    if (top < GAME_HEIGHT) {
      window.requestAnimationFrame(moveRock); 
    } else {
      rock.remove();
      scoreCounter += 100; 
      SCORE.innerHTML = "Score: " + scoreCounter;
    }
  }

  window.requestAnimationFrame(moveRock); 
  ROCKS.push(rock)
  return rock
}

function lerpClamped(start, end, interpolant) {
  if (interpolant > 1) { 
    interpolant = 1; 
  } else if (interpolant < 0) { 
    interpolant = 0; 
  }
  lerpUnclamped(start, end, interpolant);
}

function lerpUnclamped(start, end, interpolant) {
  let diff = end - start;
  return (diff * interpolant) + start;
}

function endGame() {

  // clearInterval(gameInterval); 
  clearTimeout(rockCountdown); 
  removeEventListener("keyup", stopDodger); 
  removeEventListener('keydown', moveDodger); 

  ROCKS.forEach(function(rock) {
    rock.remove(); 
  })

  alert("You lose!"); 
}

function moveDodger(e) {
  switch(e.which) {
    case LEFT_ARROW:

      leftDown = true;
      rightDown = false;

      if (!isMoving) {
        moveDodgerLeft();
        isMoving = true;
      }  
      break;

    case RIGHT_ARROW:

      leftDown = false;
      rightDown = true;

      if (!isMoving) {
        moveDodgerRight();
        isMoving = true;
      }  
      break;
  }
}

function moveDodgerLeft() {
  var currentPos = positionToInteger(DODGER.style.left);

  function step() {
    if (leftDown && currentPos > 0) {
      DODGER.style.left = `${currentPos -= dodgerSpeed}px`;
      window.requestAnimationFrame(step); 
    } 
  }
  
  step(); 
}

function moveDodgerRight() {
  var currentPos = positionToInteger(DODGER.style.left);

  function step() {
    if (rightDown && currentPos < GAME_WIDTH - 40) {
      DODGER.style.left = `${currentPos += dodgerSpeed}px`;
      window.requestAnimationFrame(step); 
    } 
  }

  step(); 
}

function stopDodger() {
  leftDown = false;
  rightDown = false;
  isMoving = false;
}

function setGameInterval(speed) {
  clearInterval(gameInterval); 
  gameInterval = setInterval(function() {
    createRock(Math.floor(Math.random() *  (GAME_WIDTH - 20)))
  }, speed)
}

function setRockCountdown(time) {
  createRock(Math.floor(Math.random() * (GAME_WIDTH - 20))); 

  let newCountdownTime = 1000 - (1000 * (scoreCounter/maxScore));
  rockCountdown = setTimeout(function() {
    setRockCountdown(1000); 
  }, newCountdownTime); 
}

/**
 * @param {string} p The position property
 * @returns {number} The position as an integer (without 'px')
 */
function positionToInteger(p) {
  return parseInt(p.split('px')[0]) || 0
}

function start() {
  window.addEventListener('keydown', moveDodger)
  window.addEventListener("keyup", stopDodger);

  START.style.display = 'none'

  // setGameInterval(1000); 
  rockCountdown = setTimeout(function() {
    setRockCountdown(1000); 
  }, 1000); 
}
