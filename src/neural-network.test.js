import { FFNetwork, activation } from './neural-network.js';

describe('FFNetwork', () => {
  it('constructor should work', () => {
    const nn = new FFNetwork([3, 5, 2]);
    expect(nn.layers.length).toBe(3);
    expect(nn.layers[0].neurons.length).toBe(3);
    expect(nn.layers[1].neurons.length).toBe(5);
    expect(nn.layers[2].neurons.length).toBe(2);
    expect(nn.layers[0].neurons[0].dendrite.length).toBe(5);
    expect(nn.layers[0].neurons[1].dendrite.length).toBe(5);
    expect(nn.layers[0].neurons[2].dendrite.length).toBe(5);
    expect(nn.layers[1].neurons[0].dendrite.length).toBe(2);
    expect(nn.layers[1].neurons[1].dendrite.length).toBe(2);
    expect(nn.layers[1].neurons[2].dendrite.length).toBe(2);
    expect(nn.layers[1].neurons[3].dendrite.length).toBe(2);
    expect(nn.layers[1].neurons[4].dendrite.length).toBe(2);
    expect(nn.layers[2].neurons[0].dendrite.length).toBe(0);
    expect(nn.layers[2].neurons[1].dendrite.length).toBe(0);
  });

  it('getWeights', () => {
    const nn = new FFNetwork([3, 5, 2]);
    expect(nn.layers.length).toBe(3);
    let i = 0;
    nn.layers[0].neurons[0].dendrite = [++i, ++i, ++i, ++i, ++i];
    nn.layers[0].neurons[1].dendrite = [++i, ++i, ++i, ++i, ++i];
    nn.layers[0].neurons[2].dendrite = [++i, ++i, ++i, ++i, ++i];
    nn.layers[1].neurons[0].dendrite = [++i, ++i];
    nn.layers[1].neurons[1].dendrite = [++i, ++i];
    nn.layers[1].neurons[2].dendrite = [++i, ++i];
    nn.layers[1].neurons[3].dendrite = [++i, ++i];
    nn.layers[1].neurons[4].dendrite = [++i, ++i];
    nn.layers[2].neurons[0].dendrite = [];
    nn.layers[2].neurons[1].dendrite = [];
    expect(nn.getWeights()).toEqual([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
    ]);
  });

  it('setWeights', () => {
    const nn = new FFNetwork([3, 5, 2]);
    expect(nn.layers.length).toBe(3);
    nn.setWeights([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
    ]);
    let i = 0;
    expect(nn.layers[0].neurons[0].dendrite).toEqual([++i, ++i, ++i, ++i, ++i]);
    expect(nn.layers[0].neurons[1].dendrite).toEqual([++i, ++i, ++i, ++i, ++i]);
    expect(nn.layers[0].neurons[2].dendrite).toEqual([++i, ++i, ++i, ++i, ++i]);
    expect(nn.layers[1].neurons[0].dendrite).toEqual([++i, ++i]);
    expect(nn.layers[1].neurons[1].dendrite).toEqual([++i, ++i]);
    expect(nn.layers[1].neurons[2].dendrite).toEqual([++i, ++i]);
    expect(nn.layers[1].neurons[3].dendrite).toEqual([++i, ++i]);
    expect(nn.layers[1].neurons[4].dendrite).toEqual([++i, ++i]);
    expect(nn.layers[2].neurons[0].dendrite).toEqual([]);
    expect(nn.layers[2].neurons[1].dendrite).toEqual([]);
  });

  it('getBias', () => {
    const nn = new FFNetwork([3, 5, 2]);
    expect(nn.layers.length).toBe(3);
    let i = 0;
    nn.layers[0].neurons[0].bias = ++i;
    nn.layers[0].neurons[1].bias = ++i;
    nn.layers[0].neurons[2].bias = ++i;
    nn.layers[1].neurons[0].bias = ++i;
    nn.layers[1].neurons[1].bias = ++i;
    nn.layers[1].neurons[2].bias = ++i;
    nn.layers[1].neurons[3].bias = ++i;
    nn.layers[1].neurons[4].bias = ++i;
    nn.layers[2].neurons[0].bias = ++i;
    nn.layers[2].neurons[1].bias = ++i;
    expect(nn.getBias()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('setBias', () => {
    const nn = new FFNetwork([3, 5, 2]);
    expect(nn.layers.length).toBe(3);
    nn.setBias([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let i = 0;
    expect(nn.layers[0].neurons[0].bias).toBe(++i);
    expect(nn.layers[0].neurons[1].bias).toBe(++i);
    expect(nn.layers[0].neurons[2].bias).toBe(++i);
    expect(nn.layers[1].neurons[0].bias).toBe(++i);
    expect(nn.layers[1].neurons[1].bias).toBe(++i);
    expect(nn.layers[1].neurons[2].bias).toBe(++i);
    expect(nn.layers[1].neurons[3].bias).toBe(++i);
    expect(nn.layers[1].neurons[4].bias).toBe(++i);
    expect(nn.layers[2].neurons[0].bias).toBe(++i);
    expect(nn.layers[2].neurons[1].bias).toBe(++i);
  });

  it('run complex', () => {
    const nn = new FFNetwork([3, 5, 2]);
    expect(nn.layers.length).toBe(3);
    nn.setWeights([
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
      0.6,
      0.7,
      0.8,
      0.9,
      0.0,
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
      0.6,
      0.7,
      0.8,
      0.9,
      0.0,
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
    ]);
    nn.setBias([1, 2, 3, 2, 2, 3, 1, 2, 3, 1]);
    expect(nn.run([1, 2, 3])).toEqual([
      0.12609016752653404,
      0.5856069780640133,
    ]);
  });

  it('run simple', () => {
    const nn = new FFNetwork([2, 2]);
    nn.setWeights([1, 1, 1, 1]);
    nn.setBias([0, 0, 0, 0]);
    expect(nn.run([1, 1])).toEqual([activation(2), activation(2)]);
  });

  it('run simple 2', () => {
    const nn = new FFNetwork([2, 2]);
    nn.setWeights([1, 2, 3, 4]);
    nn.setBias([0, 0, 0, 0]);
    expect(nn.run([1, 1])).toEqual([activation(4), activation(6)]);
  });

  it('run simple no bias', () => {
    const nn = new FFNetwork([2, 3, 1]);
    nn.setWeights([0.8, 0.4, 0.3, 0.2, 0.9, 0.5, 0.3, 0.5, 0.9]);
    nn.setBias([0, 0, 0, 0, 0, 0]);
    expect(nn.run([1, 1])).toEqual([0.7743802720529458]);
  });

  // TODO: more test
});
