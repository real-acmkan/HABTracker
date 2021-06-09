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

    private void Update()
    {
        Vector3 position = Conversions.GeoToWorldPosition(LatLng, Map.CenterMercator, Map.WorldRelativeScale).ToVector3xz();

        float step = 5 * Time.deltaTime;
        transform.position = Vector3.MoveTowards(transform.position, position, step);
    }
}
