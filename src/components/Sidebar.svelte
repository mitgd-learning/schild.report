<script>
  import { rollup } from "./App.svelte";
  import * as Comlink from "comlink";
  import {
    configData,
    component,
    dokument,
    repo,
    reload,
    warten
  } from "./../stores.js";
  import { join } from "path";

  export let repos;
  export let highlight;

  function callback() {
    console.log("Modul wurde modifiziert, ...");
    run_rollup();
  }
  async function run_rollup(args) {
    $warten = true;
    console.log("rollup starten...");
    const options =
      args && args.file
        ? {
            source: join($configData.reports, args.repo, args.file),
            dest: join($configData.userData),
            debug: args.debug || true,
            plugin: args.file.startsWith("plugin")
          }
        : null;
    try {
      await rollup.set_options(options);
    } catch (error) { console.log(error)}
    try {
      const res = await rollup.build();
      if (args) {
        $component = null;
        $dokument = args.file;
        $repo = args.repo;
      }
      $reload += 1;
    } catch (error) {
      console.log(error);
    }
    $warten = false;
    await rollup.watch(Comlink.proxy(callback));
  }
  function toggle_folder_state(key) {
    $configData.folderStates[key] = !$configData.folderStates[key];
  }
</script>

<style>
  .sidebar {
    padding-top: .3rem;
    border-right: 1px solid #c5cad3;
  }
  .sidebar .tree-group {
    padding: 0;
    margin: 0;
  }
  .sidebar .tree-item {
    padding: 2px 0 2px 25px;
    list-style: none;
    position: relative;
  }
  .sidebar .tree-item-label.tree-header {
    font-weight: bold;
    text-transform: uppercase;
  }
  .sidebar .tree-item.active {
    background-color: hsl(0, 0%, 71%);
  }
  .sidebar .tree-item.hoverable:hover {
    background-color: DodgerBlue;
    color: #ffffff;
  }
  .sidebar .tree-item:before {
    font-family: "Material Icons" !important;
    position: absolute;
    left: 10px;
  }
  .sidebar .tree-item.tree-item--chevron-down:before {
    font-weight: bold;
    content: "keyboard_arrow_down";
  }
  .sidebar .tree-item.closed:before {
    font-weight: bold;
    content: "chevron_right";
  }
  .sidebar .tree-item-label {
    display: flex;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    width: 220px;
    display: inline-block;
    text-overflow: ellipsis;
  }
  .sidebar .tree-item-label:before {
    font-family: "Material Icons" !important;
    font-size: 17px;
    margin-right: 10px;
  }
</style>

<div class="sidebar">
  {#each Object.entries(repos) as [key, values]}
    <ul class="tree-group">
      <li
        class="tree-item tree-item--chevron-down"
        class:closed={$configData.folderStates[key]}
        on:click={() => toggle_folder_state(key)}>
        <span class="tree-item-label tree-header">{key}</span>
      </li>
      {#if !$configData.folderStates[key]}
        <ul class="tree-group">
          {#each values as v}
            <li
              class="tree-item hoverable"
              class:active={key === $repo && v === $dokument && !highlight}
              on:click={() => run_rollup({ repo: key, file: v })}>
              <span class="tree-item-label">{v.replace(/\.[^/.]+$/, '')}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </ul>
  {:else}Keine Dokumente vorhanden{/each}
</div>
