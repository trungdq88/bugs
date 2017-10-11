import p5 from 'p5';
import { FFNetwork } from './neural-network.js';

const NETWORK_STRUCTURE = [2, 100, 2];
const MUTATION_RATE = 0.01;
const ELITISM_RATE = 0.4;
const SIZE = 700;
const INITIAL_FOOD_COUNT = 200;
const BUG_POPULATION = 30;
const FOOD_SIZE = 5;
const BUG_SIZE = 5;
const BUG_SPEED = 2;
const BUG_MAX_AGE = 1000;
const BUG_SMELL_RANGE = 20;
const DEFAULT_BUG_ENERGY = 200;
const FOOD_ENERGY = 50;
const FOOD_DROP_FRAME = 10;

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
    energy = DEFAULT_BUG_ENERGY;
    brain = new FFNetwork(NETWORK_STRUCTURE);
    constructor(position, brain) {
      this.position = position;
      if (brain) {
        this.brain = brain;
      }
    }
    getClosestFood = () => {
      const head = this.getHead();
      return (
        foods
          .filter(food => !food.gone)
          .map((food, index) => ({
            ...food,
            distance: p5.Vector.sub(food.position, this.position).mag(),
            angle: p5.Vector
              .sub(this.position, head)
              .angleBetween(p5.Vector.sub(head, food.position)),
          }))
          // .map(food => {
          //   if (food.angle <= p.HALF_PI || food.distance <= BUG_SMELL_RANGE) {
          //     food.inRange();
          //   } else {
          //     food.outRange();
          //   }
          //   return food;
          // })
          .filter(
            food => food.angle <= p.HALF_PI || food.distance <= BUG_SMELL_RANGE,
          )
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
        this.age > BUG_MAX_AGE ||
        this.energy <= 0
      ) {
        this.dead = true;
        return;
      }
      this.age += 1;
      this.energy -= 1;
      const closestFood = this.getClosestFood();
      // console.log(closestFood && closestFood.distance);
      if (closestFood && closestFood.distance < FOOD_SIZE + BUG_SIZE) {
        this.energy += FOOD_ENERGY;
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

  let generationNo = 1;
  let foods = [];
  let bugs = [];
  let time = 0;

  const createBugs = () => {
    bugs = [];
    for (let i = 0; i < BUG_POPULATION; i++) {
      bugs.push(new Bug(p.createVector(p.random(SIZE), p.random(SIZE))));
    }
  };

  const dropFood = () => {
    foods.push(new Food(p.createVector(p.random(SIZE), p.random(SIZE))));
  };

  const createFoods = () => {
    foods = [];
    for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
      dropFood();
    }
  };

  const endGeneration = () => {
    const newBugs = [];
    p.noLoop();

    // Calculate fitness
    const totalAge = bugs.map(bug => bug.age).reduce((a, b) => a + b);
    for (let i = 0; i < bugs.length; i++) {
      bugs[i].fitness = bugs[i].age / totalAge;
    }
    bugs.sort((a, b) => (a.fitness < b.fitness ? 1 : -1));

    const highestFitness = Math.max.apply(Math, bugs.map(bug => bug.fitness));
    const averageFitness =
      bugs.map(bug => bug.fitness).reduce((a, b) => a + b) / bugs.length;

    console.log({
      highestFitness,
      averageFitness,
    });

    // Calculate Accumulated Fitness (for selection)
    bugs[0].accumulatedFitness = bugs[0].fitness;
    for (let i = 1; i < bugs.length; i++) {
      bugs[i].accumulatedFitness =
        bugs[i].fitness + bugs[i - 1].accumulatedFitness;
    }

    console.log(bugs);

    // Elitism
    const elitismCount = Math.round(bugs.length * ELITISM_RATE);
    for (let i = 0; i < elitismCount; i++) {
      newBugs.push(
        new Bug(
          p.createVector(p.random(SIZE), p.random(SIZE)),
          new FFNetwork(NETWORK_STRUCTURE, bugs[i].brain.getStructure()),
        ),
      );
    }

    // Cross over
    const crossOverCount = bugs.length - elitismCount;
    const selection = () => {
      // Selection method:
      // https://en.wikipedia.org/wiki/Selection_(genetic_algorithm)
      const r = Math.random();
      for (let i = 0; i < bugs.length; i++) {
        if (bugs[i].accumulatedFitness > r) {
          return bugs[i];
        }
      }
    };
    for (let i = 0; i < crossOverCount; i++) {
      const parentA = selection();
      const parentB = selection();
      const parentAStructure = parentA.brain.getStructure();
      const parentBStructure = parentB.brain.getStructure();
      // Single point cross over
      // https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)
      const childStructure = [];
      const crossOverPoint = p.random(0, parentAStructure.length - 1);
      for (let j = 0; j < parentAStructure.length; j++) {
        if (j < crossOverPoint) {
          childStructure.push(parentAStructure[j]);
        } else {
          childStructure.push(parentBStructure[j]);
        }
      }
      const child = new Bug(
        p.createVector(p.random(SIZE), p.random(SIZE)),
        new FFNetwork(NETWORK_STRUCTURE, childStructure),
      );
      newBugs.push(child);
    }

    // Mutation
    for (let i = 0; i < newBugs.length; i++) {
      if (Math.random() < MUTATION_RATE) {
        const data = newBugs[i].brain.getStructure();
        const mutationPoint = p.random(0, data.length - 1);
        data[mutationPoint] = Math.random();
        newBugs[i].brain.setStructure(data);
      }
    }

    // Mutation
    bugs = newBugs;
    setTimeout(() => {
      createNextGeneration();
    }, 1000);
  };

  const createNextGeneration = () => {
    console.log('Generation', ++generationNo);
    time = 0;
    createFoods();
    p.loop();
  };

  p.setup = () => {
    p.createCanvas(SIZE, SIZE);
    p.frameRate(30);
    createBugs();
    createFoods();
  };

  p.draw = function() {
    p.background(200);
    const remainingFoods = foods.filter(food => !food.gone);
    const remainingBugs = bugs.filter(bug => !bug.dead);
    if (remainingBugs.length === 0) {
      endGeneration();
      return;
    }
    remainingFoods.forEach(food => food.draw());
    remainingBugs.forEach(bug => {
      bug.update();
      bug.draw();
    });
    if (++time % FOOD_DROP_FRAME === 0) {
      dropFood();
    }
  };
};

new p5(sketch);
