<script lang="ts">
    import type { Engine } from 'webgl-engine';

    let webglCanvas: HTMLCanvasElement;
    let debugEl: HTMLDivElement;
    let initialized = false;

    setInterval(() => {
        // @ts-ignore
        const engine: Engine<unknown> = window['gameEngine'];

        if (debugEl && engine) {
            debugEl.innerText = engine._debugLogs;
        }
    }, 50);

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
    <div class="screen">
        <canvas id="canvas" bind:this={webglCanvas} />
        <div id="debug" bind:this={debugEl} />
    </div>
</div>

<style>
    .container {
        height: 100%;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        align-items: center;
        flex-grow: 1;
    }

    .screen {
        width: 90%;
        max-width: 1960px;
        aspect-ratio: 16 / 9;
        margin-right: auto;
        margin-left: auto;
        position: relative;
    }

    #canvas {
        width: 100%;
        max-width: 1960px;
        aspect-ratio: 16 / 9;
        margin-right: auto;
        margin-left: auto;
    }

    #debug {
        opacity: 0.5;
        color: white;
        font-size: 1.35rem;
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }
</style>
