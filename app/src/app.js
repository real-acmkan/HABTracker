// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const apiOptions = {
  apiKey: '',
  version: "beta",
  map_ids: [""]
};
//lat: 51.4855123, lng: -113.1693358
const mapOptions = {
  "tilt": 0,
  "heading": 0,
  "zoom": 18,
  "center": { lat: 51.4855123, lng: -113.1693358 },
  "mapId": "",
  "mapTypeId": "satellite"    
}

async function initMap() {    
  const mapDiv = document.getElementById("map");
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();
  return new google.maps.Map(mapDiv, mapOptions);
}


function initWebglOverlayView(map) {  
  let scene, renderer, camera, loader;
  const webglOverlayView = new google.maps.WebglOverlayView();
  
  webglOverlayView.onAdd = () => {   
    // set up the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.75 ); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);
  
    // load the model    
    loader = new GLTFLoader();               
    const source = "HotAirBalloon_01.gltf";
    loader.load(
      source,
      gltf => {      
        //gltf.scene.scale.set(25,25,25);
        gltf.scene.position.z = 1000;
        gltf.scene.rotation.x = 90 * Math.PI / 180;
        document.onkeydown = function (event) {
          switch (event.keyCode) {
             case 37:
                console.log("Left key is pressed.");
                break;
             case 38:
                console.log("Up key is pressed.");
                break;
             case 39:
                console.log("Right key is pressed.");
                break;
             case 40:
                console.log("Down key is pressed.");
                break;
          }
       };
        //gltf.scene.rotation.set(-300, 0, 0); 
        // rotations are in radians
        scene.add(gltf.scene);                   
      }
    );
  }
  
  webglOverlayView.onContextRestored = (gl) => {        
    // create the three.js renderer, using the
    // maps's WebGL rendering context.
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl, ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // wait to move the camera until the 3D model loads    
    loader.manager.onLoad = () => {        
      renderer.setAnimationLoop(() => {
        map.moveCamera({
          "tilt": mapOptions.tilt,
          "heading": mapOptions.heading,
          "zoom": 15
        });            
        
        // rotate the map 360 degrees 
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5
        } else if (mapOptions.heading <= 360) {
          mapOptions.heading += 0.2;
        } else {
          renderer.setAnimationLoop(null)
        }
      });        
    }
  }

  webglOverlayView.onDraw = (gl, coordinateTransformer) => {
    // update camera matrix to ensure the model is georeferenced correctly on the map     
    const matrix = coordinateTransformer.fromLatLngAltitude(mapOptions.center, 120);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
    
    webglOverlayView.requestRedraw();      
    renderer.render(scene, camera);                  

    // always reset the GL state
    renderer.resetState();
  }
  webglOverlayView.setMap(map);
}

(async () => {        
  const map = await initMap();
  initWebglOverlayView(map);    
})();