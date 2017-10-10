import p5 from 'p5';
import { FFNetwork } from './neural-network.js';

const SIZE = 700;
const BUG_POPULATION = 10;
const FOOD_SIZE = 5;
const BUG_SIZE = 5;
const BUG_SPEED = 2;
const BUG_MAX_AGE = 2000;
const BUG_BONUS_AGE = 200;

const sketch = p => {
  class Food {
    position = p.createVector(0, 0);
    gone = false;
    targeted = false;
    constructor(position) {
      this.position = position;
    }
    draw = () => {
      if (this.targeted) {
        p.fill(190, 70, 20);
      } else {
        p.fill(0);
      }
      p.ellipse(this.position.x, this.position.y, FOOD_SIZE);
    };
    eaten = () => {
      this.gone = true;
    };
    inRange = () => (this.targeted = true);
    outRange = () => (this.targeted = false);
  }

  class Bug {
    angle = p.random(0, p.TWO_PI); // radian
    position = p.createVector(0, 0);
    dead = false;
    age = 0;
    brain = new FFNetwork([2, 100, 2]);
    constructor(position, foods = []) {
      this.position = position;
    }
    getClosestFood = () => {
      const head = this.getHead();
      return (
        foods
          .map((food, index) => ({
            ...food,
            distance: p5.Vector.sub(food.position, this.position).magSq(),
            angle: p5.Vector
              .sub(this.position, head)
              .angleBetween(p5.Vector.sub(head, food.position)),
          }))
          // .map(food => {
          //   if (food.angle <= p.HALF_PI) {
          //     food.inRange();
          //   } else {
          //     food.outRange();
          //   }
          //   return food;
          // })
          .filter(food => food.angle <= p.HALF_PI)
          .reduce((prev, curr) => {
            return prev && prev.distance < curr.distance ? prev : curr;
          }, null)
      );
    };
    getLeftAntena = () =>
      p.createVector(
        this.position.x + Math.cos(this.angle - p.QUARTER_PI) * 8,
        this.position.y + Math.sin(this.angle - p.QUARTER_PI) * 8,
      );
    getRightAntena = () =>
      p.createVector(
        this.position.x + Math.cos(this.angle + p.QUARTER_PI) * 8,
        this.position.y + Math.sin(this.angle + p.QUARTER_PI) * 8,
      );
    getHead = () =>
      p.createVector(
        this.position.x + Math.cos(this.angle) * 10,
        this.position.y + Math.sin(this.angle) * 10,
      );
    getTail = () =>
      p.createVector(
        this.position.x - Math.cos(this.angle) * 10,
        this.position.y - Math.sin(this.angle) * 10,
      );
    draw = () => {
      p.fill(255);
      const leftAntena = this.getLeftAntena();
      const rightAntena = this.getRightAntena();
      const tail = this.getTail();
      p.line(this.position.x, this.position.y, tail.x, tail.y);
      p.line(this.position.x, this.position.y, leftAntena.x, leftAntena.y);
      p.line(this.position.x, this.position.y, rightAntena.x, rightAntena.y);
      p.ellipse(this.position.x, this.position.y, BUG_SIZE);
    };
    update = () => {
      if (
        this.position.x < 0 ||
        this.position.x > SIZE ||
        this.position.y < 0 ||
        this.position.y > SIZE ||
        this.age > BUG_MAX_AGE
      ) {
        this.dead = true;
        return;
      }
      this.age += 1;
      const closestFood = this.getClosestFood();
      if (closestFood && closestFood.distance < (FOOD_SIZE + BUG_SIZE) / 2) {
        this.age -= BUG_BONUS_AGE;
        closestFood.eaten();
      }
      const leftAntena = this.getLeftAntena();
      const rightAntena = this.getRightAntena();
      let leftAntenaDistance = 1;
      let rightAntenaDistance = 1;
      const scale = SIZE * SIZE / 100;
      if (closestFood) {
        leftAntenaDistance =
          p5.Vector.sub(leftAntena, closestFood.position).magSq() / scale;
        rightAntenaDistance =
          p5.Vector.sub(rightAntena, closestFood.position).magSq() / scale;
      }
      // console.log(leftAntenaDistance, rightAntenaDistance);
      const [shouldTurnLeft, shouldTurnRight] = this.brain.run([
        leftAntenaDistance,
        rightAntenaDistance,
      ]);
      const turnRate = p.PI / 36;
      if (shouldTurnLeft > shouldTurnRight) {
        // console.log('left');
        this.angle += turnRate;
      } else {
        // console.log('right');
        this.angle -= turnRate;
      }
      const nextMove = p.createVector(
        Math.cos(this.angle) * BUG_SPEED,
        Math.sin(this.angle) * BUG_SPEED,
      );
      this.position.add(nextMove);
    };
  }

  const foods = [];
  let bugs = [];

  setInterval(() => {
    foods.push(new Food(p.createVector(p.random(SIZE), p.random(SIZE))));
  }, 100);

  const createBugs = () => {
    bugs = [];
    for (let i = 0; i < BUG_POPULATION; i++) {
      bugs.push(new Bug(p.createVector(p.random(SIZE), p.random(SIZE))));
    }
  };

  p.setup = () => {
    p.createCanvas(SIZE, SIZE);
    p.frameRate(30);
    createBugs();
  };

  p.draw = function() {
    p.background(200);
    foods.filter(food => !food.gone).forEach(food => food.draw());
    bugs.filter(bug => !bug.dead).forEach(bug => {
      bug.update();
      bug.draw();
    });
  };
};

new p5(sketch);
