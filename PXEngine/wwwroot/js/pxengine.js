let engine, scene;

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

                            export async function init(canvasId) {
                              await loadScript("https://cdn.babylonjs.com/babylon.js");
                                const canvas = document.getElementById(canvasId);
                                  engine = new BABYLON.Engine(canvas, true);
                                    scene = new BABYLON.Scene(engine);
                                      scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

                                        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 5, BABYLON.Vector3.Zero(), scene);
                                          camera.attachControl(canvas, true);

                                            new BABYLON.HemisphericLight("lumiere", new BABYLON.Vector3(1, 1, 0), scene);

                                              const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 1.5 }, scene);
                                                const mat = new BABYLON.StandardMaterial("matiere", scene);
                                                  mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1);
                                                    cube.material = mat;

                                                      engine.runRenderLoop(() => {
                                                          cube.rotation.y += 0.01;
                                                              cube.rotation.x += 0.005;
                                                                  scene.render();
                                                                    });

                                                                      window.addEventListener("resize", () => engine.resize());
                                                                      }