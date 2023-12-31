import './app.css';
import App from './App.svelte';
import { Engine } from 'webgl-engine';
import { PrototypeScene } from './scenes/prototype';
import type { GameProps } from './constants';

const engine = new Engine<GameProps>();

engine.properties = {
    blurbs: [],
};

// @ts-ignore
window['gameEngine'] = engine;

// TODO: Manage scenes
engine.addScene(PrototypeScene);

function draw() {
    engine.draw();
    requestAnimationFrame(draw.bind(engine));
}

function update() {
    engine.update();
    requestAnimationFrame(update.bind(engine));
}

draw();
update();

const app = new App({
    target: document.getElementById('app') ?? document.createElement('div'),
});

export default app;
