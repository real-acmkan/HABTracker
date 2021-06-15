using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mapbox.Utils;
using Mapbox.Unity.Utilities;
using Mapbox.Unity.Map;

public class PathFollower : MonoBehaviour
{
    [SerializeField] public AbstractMap Map;
    [SerializeField] public Vector2d LatLng;
    [SerializeField] int height;
    [SerializeField] float step;

    void Start() {
        // https://www.youtube.com/watch?v=mAeTRCT0qZg
        TextAsset data = Resources.Load<TextAsset>("data");
        string [] dt = data.text.Split(new char[] { '\n' });
        for(int i = 1; i < dt.Length; i++) {
           Points p = new Points();
        }
    }

    void Update() {
        Vector3 position = Conversions.GeoToWorldPosition(LatLng, Map.CenterMercator, Map.WorldRelativeScale).ToVector3xz();

        position.z = height;
        transform.position = Vector3.MoveTowards(transform.position, position, step * Time.deltaTime);

        // if(Vector3.Distance(transform.position, newTarget.position) < 0.1f){
        //         It is within ~0.1f range, do stuff
        // }
    }
}
