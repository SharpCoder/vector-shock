<script lang="ts">
    import type { Engine } from 'webgl-engine';

    let webglCanvas: HTMLCanvasElement;
    let initialized = false;

    $: {
        // @ts-ignore
        const engine: Engine<unknown> = window['gameEngine'];

        if (webglCanvas && !initialized) {
            initialized = true;
            engine.initialize(webglCanvas);
        } else if (webglCanvas) {
            engine.setCanvas(webglCanvas);
        }
    }
</script>

<div class="container">
    <canvas id="canvas" bind:this={webglCanvas} />
</div>

<style>
    .container {
        width: 80%;
        height: 100%;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        align-items: center;
        flex-grow: 1;
    }

    #canvas {
        width: 80%;
        max-width: 1960px;
        aspect-ratio: 16 / 9;
        margin-right: auto;
        margin-left: auto;
    }
</style>
