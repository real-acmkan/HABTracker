using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mapbox.Utils;
using Mapbox.Unity.Utilities;
using Mapbox.Unity.Map;

public class PathFollower : MonoBehaviour
{
    [SerializeField] public List<Points> points = new List<Points>();
    [SerializeField] public AbstractMap Map;
    [SerializeField] public Vector2d LatLng;
    [SerializeField] int height;
    [SerializeField] float step;
    Points p = new Points();

    // public bool atPos;
    
    //float inc = 1.0f;

    void Start() {
        // https://www.youtube.com/watch?v=mAeTRCT0qZg
        TextAsset data = Resources.Load<TextAsset>("data");
        string[] dt = data.text.Split(new char[] { '\n' });
        for (int i = 1; i < dt.Length; i++) {
            // atPos = false;
            string[] row = dt[i].Split(new char[] { ',' });
            p.altitude = float.Parse(row[0]);
            p.latitude = float.Parse(row[1]);
            p.longitude = float.Parse(row[2]);
            p.velocity = float.Parse(row[3]);
            p.heading = float.Parse(row[4]);
            p.time = row[5];
            points.Add(p);
        }
    }

    void Update() {
        
        foreach (Points p in points) {
            LatLng.x = p.latitude;
            LatLng.y = p.longitude;
            Vector3 position = Conversions.GeoToWorldPosition(LatLng, Map.CenterMercator, Map.WorldRelativeScale).ToVector3xz();
            position.z = height;
            transform.position = Vector3.MoveTowards(transform.position, position, step * Time.deltaTime);
        }

        
        // if (Vector3.Distance(transform.position, newTarget.position) < 0.1f){
        //         It is within ~0.1f range, do stuff
        // }    
    }
}
