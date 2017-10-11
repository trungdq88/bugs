export const activation = x => 1 / (1 + Math.exp(x * -1));

export class Neuron {
  bias = Math.random();
  value = 0;
  dendrite = []; // weights of the connections to the next layer
  constructor(dendriteCount) {
    for (let i = 0; i < dendriteCount; i++) {
      this.dendrite.push(Math.random());
    }
  }
}

export class Layer {
  neurons = [];
  constructor(neuronCount, nextLayerNeuronCount = 0) {
    for (let i = 0; i < neuronCount; i++) {
      this.neurons.push(new Neuron(nextLayerNeuronCount));
    }
  }
}

export class FFNetwork {
  layers = [];

  constructor(structure = []) {
    for (let i = 0; i < structure.length; i++) {
      const isLastLayer = i === structure.length - 1;
      const neuronCount = structure[i];
      if (isLastLayer) {
        this.layers.push(new Layer(neuronCount));
      } else {
        const nextLayerNeuronCount = structure[i + 1];
        this.layers.push(new Layer(neuronCount, nextLayerNeuronCount));
      }
    }
  }

  run(input) {
    if (this.layers.length < 2) return input;
    if (input.length !== this.layers[0].neurons.length) {
      throw new Error('Wrong input shape');
    }

    // Set value for input layer
    for (let i = 0; i < this.layers[0].neurons.length; i++) {
      this.layers[0].neurons[i].value = input[i];
    }

    // Calculate the next layers
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      for (
        let neuronIndex = 0;
        neuronIndex < this.layers[layerIndex].neurons.length;
        neuronIndex++
      ) {
        let value = 0;
        const previousLayer = this.layers[layerIndex - 1];
        previousLayer.neurons.forEach(neuron => {
          value += neuron.value * neuron.dendrite[neuronIndex];
        });
        value -= this.layers[layerIndex].neurons[neuronIndex].bias;
        this.layers[layerIndex].neurons[neuronIndex].value = activation(value);
      }
    }

    return this.layers[this.layers.length - 1].neurons.map(
      neuron => neuron.value,
    );
  }

  getWeights() {
    const weights = [];
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        neuron.dendrite.forEach(weight => weights.push(weight));
      });
    });
    return weights;
  }

  setWeights(weights) {
    let i = 0;
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        neuron.dendrite.forEach((_, index) => {
          neuron.dendrite[index] = weights[i];
          i += 1;
        });
      });
    });
  }

  getBias() {
    const bias = [];
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        bias.push(neuron.bias);
      });
    });
    return bias;
  }

  setBias(bias) {
    let i = 0;
    this.layers.forEach(layer => {
      layer.neurons.forEach((_, index) => {
        layer.neurons[index].bias = bias[i];
        i += 1;
      });
    });
  }

  getStructure() {
    const result = [];
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        neuron.dendrite.forEach(weight => result.push(weight));
        result.push(neuron.bias);
      });
    });
    return result;
  }

  setStructure(structure) {
    let i = 0;
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        neuron.dendrite.forEach((_, index) => {
          neuron.dendrite[index] = structure[i];
          i += 1;
        });
        neuron.bias = structure[i];
        i += 1;
      });
    });
  }
}
