import p5 from 'p5';

const SIZE = 700;
const BUG_POPULATION = 10;
const FOOD_SIZE = 5;
const BUG_SIZE = 5;
const BUG_SPEED = 2;

const sketch = p => {
  class Food {
    position = p.createVector(0, 0);
    constructor(position) {
      this.position = position;
    }
    draw = () => {
      p.fill(0);
      p.ellipse(this.position.x, this.position.y, FOOD_SIZE);
    };
  }
  class Bug {
    brain = {};
    angle = p.random(0, p.TWO_PI); // radian
    position = p.createVector(0, 0);
    dead = false;
    constructor(position) {
      this.position = position;
    }
    draw = () => {
      p.fill(255);
      p.line(
        this.position.x,
        this.position.y,
        this.position.x - Math.cos(this.angle) * 10,
        this.position.y - Math.sin(this.angle) * 10,
      );
      p.ellipse(this.position.x, this.position.y, BUG_SIZE);
    };
    update = () => {
      if (
        this.position.x < 0 ||
        this.position.x > SIZE ||
        this.position.y < 0 ||
        this.position.y > SIZE
      ) {
        this.dead = true;
        return;
      }
      this.position.add(
        p.createVector(
          Math.cos(this.angle) * BUG_SPEED,
          Math.sin(this.angle) * BUG_SPEED,
        ),
      );
    };
  }

  const foods = [];
  let bugs = [];

  setInterval(() => {
    foods.push(new Food(p.createVector(p.random(SIZE), p.random(SIZE))));
  }, 1000);

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
    foods.forEach(food => food.draw());
    bugs.filter(bug => !bug.dead).forEach(bug => {
      bug.update();
      bug.draw();
    });
  };
};

new p5(sketch);
