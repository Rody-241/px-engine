// PX Engine - affichage 3D (Babylon.js)
// Le JavaScript ne fait qu'afficher : c'est le C# qui décide de tout.

let engine, scene, dotnet, highlight;
const meshes = {};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.BABYLON) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function init(canvasId, dotnetRef) {
  dotnet = dotnetRef;
  await loadScript("https://cdn.babylonjs.com/babylon.js");

  const canvas = document.getElementById(canvasId);
  engine = new BABYLON.Engine(canvas, true, { stencil: true });
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
  camera.lowerRadiusLimit = 3;
  camera.upperRadiusLimit = 40;
  camera.attachControl(canvas, true);

  new BABYLON.HemisphericLight("lumiere", new BABYLON.Vector3(1, 1, 0), scene);

  // Contour jaune autour de l'objet sélectionné
  highlight = new BABYLON.HighlightLayer("selection", scene);

  // Toucher un objet = le sélectionner (toucher le vide = désélectionner)
  scene.onPointerObservable.add((info) => {
    if (info.type !== BABYLON.PointerEventTypes.POINTERTAP) return;
    const pick = info.pickInfo;
    const mesh = pick && pick.hit ? pick.pickedMesh : null;
    const id = mesh && mesh.metadata ? mesh.metadata.id : 0;
    dotnet.invokeMethodAsync("OnPick", id);
  });

  window.addEventListener("resize", () => engine && engine.resize());
}

export function createMesh(id, shape, color) {
  let mesh;
  if (shape === "sphere") {
    mesh = BABYLON.MeshBuilder.CreateSphere("actor" + id, { diameter: 1.5 }, scene);
  } else if (shape === "ground") {
    mesh = BABYLON.MeshBuilder.CreateGround("actor" + id, { width: 20, height: 20 }, scene);
    mesh.isPickable = false;
  } else {
    mesh = BABYLON.MeshBuilder.CreateBox("actor" + id, { size: 1.5 }, scene);
  }
  const mat = new BABYLON.StandardMaterial("mat" + id, scene);
  mat.diffuseColor = BABYLON.Color3.FromHexString(color);
  mesh.material = mat;
  mesh.metadata = { id: id };
  meshes[id] = mesh;
}

export function destroyMesh(id) {
  const mesh = meshes[id];
  if (!mesh) return;
  highlight.removeMesh(mesh);
  mesh.dispose();
  delete meshes[id];
}

export function setSelected(id) {
  highlight.removeAllMeshes();
  const mesh = meshes[id];
  if (mesh) highlight.addMesh(mesh, BABYLON.Color3.Yellow());
}

// Boucle de jeu : à chaque image, le C# met à jour les Actors
// et renvoie [id, posX, posY, posZ, rotX, rotY, rotZ, tailleX, tailleY, tailleZ, ...]
export function startLoop() {
  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000;
    const d = dotnet.invokeMethod("Tick", dt);
    for (let i = 0; i < d.length; i += 10) {
      const m = meshes[d[i]];
      if (!m) continue;
      m.position.set(d[i + 1], d[i + 2], d[i + 3]);
      m.rotation.set(d[i + 4], d[i + 5], d[i + 6]);
      m.scaling.set(d[i + 7], d[i + 8], d[i + 9]);
    }
    scene.render();
  });
}

export function dispose() {
  if (engine) engine.dispose();
  engine = null;
}
