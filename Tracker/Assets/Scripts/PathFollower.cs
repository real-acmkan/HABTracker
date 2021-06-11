using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mapbox.Utils;
using Mapbox.Unity.Utilities;
using Mapbox.Unity.Map;
using Mapbox;

public class PathFollower : MonoBehaviour
{
    [SerializeField] public AbstractMap Map;
    [SerializeField] public Vector2d LatLng;
    [SerializeField] int height;
    [SerializeField] float step;

    private void Update()
    {
        Vector3 position = Conversions.GeoToWorldPosition(LatLng, Map.CenterMercator, Map.WorldRelativeScale).ToVector3xz();
        Debug.Log(Map.WorldRelativeScale);

        position.z = height;
        transform.position = Vector3.MoveTowards(transform.position, position, step * Time.deltaTime);

        // if(Vector3.Distance(transform.position, newTarget.position) < 0.1f){
        //         It is within ~0.1f range, do stuff
        // }
    }
}
