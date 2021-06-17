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
    public Vector2d NewLatLng;
    [SerializeField] int height;
    [SerializeField] float step;
    public int totalPointsAdded;
    public int counter = 0;
    public int totalPoints;
    public bool isRunning = false;
    bool isAtPoint;
    [SerializeField] LayerMask pointMask;
    [SerializeField] Transform pointCheck;
    public float pointDistance;
    // public bool isMoving;
    
    //float inc = 1.0f;

    void Start() {
        
        // https://www.youtube.com/watch?v=mAeTRCT0qZg
        TextAsset data = Resources.Load<TextAsset>("data");
        string[] dt = data.text.Split(new char[] { '\n' });
        for(int i = 1; i < dt.Length; i++) {
            // atPos = false;
            Points p = new Points();
            string[] row = dt[i].Split(new char[] { ',' });
            p.altitude = float.Parse(row[0]);
            p.latitude = float.Parse(row[1]);
            p.longitude = float.Parse(row[2]);
            p.velocity = float.Parse(row[3]);
            p.heading = float.Parse(row[4]);
            p.time = row[5];
            
            // Debug.Log(p.latitude); //THIS IS GOOD FOR INDIVIDUAL ENTRY as entity p

            points.Add(p); // This is good
            
            // Debug.Log(points[i-1].altitude); // THIS IS GOOD FOR INDIVIDUAL ENTRY in list points
            // if ( i == 50 ) {
            //     Debug.Log(points[0].altitude);
            //     Debug.Log(points[10].altitude);
            //     Debug.Log(points[20].altitude);
            //     Debug.Log(points[30].altitude);
            //     Debug.Log(points[40].altitude);
            // }

            totalPointsAdded = i-1;

        }

            //Debug.Log(points[0].altitude);
            //Debug.Log(points[100].altitude);
            //Debug.Log(points[190].altitude);
        
    }

    IEnumerator Placement() {
        float tt = 0.04f;
        
            //do {
                foreach(Points p in points) {
                    counter++;
                    //Debug.Log(counter);
                    
                    NewLatLng.x = p.latitude;
                    NewLatLng.y = p.longitude;

                    // create game object at point above


                    // Debug.Log(p.latitude + ", " + p.longitude);
                    Vector3 position = Conversions.GeoToWorldPosition(NewLatLng, Map.CenterMercator, Map.WorldRelativeScale).ToVector3xz();
                    
                    
                    position.z = height;
                    transform.position = Vector3.MoveTowards(transform.position, position, step * Time.deltaTime);
                    


                    Debug.Log(counter);
                    Debug.Log(transform.position);
                    

                    // wait until aboves game object is destroyed
                    yield return new WaitForSeconds(tt);

                    //continue
                    
                    if (counter > points.Count) {
                        break;
                    }
                }
            //} while (counter <= points.Count);
        
    }

    void Update() {
        //if (isRunning == false) {
        //    isRunning = true;
            //StartCoroutine(Placement());
            
                foreach(Points p in points) {
                    counter++;
                    //Debug.Log(counter);
                    NewLatLng.x = p.latitude;
                    NewLatLng.y = p.longitude;
                    Vector3 position = Conversions.GeoToWorldPosition(NewLatLng, Map.CenterMercator, Map.WorldRelativeScale).ToVector3xz();
                    position.z = height;
                    transform.position = Vector3.MoveTowards(transform.position, position, step * Time.deltaTime);
                    //Debug.Log(position);
                    
                    isAtPoint = Physics.CheckSphere(pointCheck.position, pointDistance, pointMask);
                    if(isAtPoint) {
                        //delete 1st point
                        Debug.Log("We're at the point");
                        points.Remove(p);
                    }
                }
        //}

        
    }

        
        // if (Vector3.Distance(transform.position, newTarget.position) < 0.1f){
        //         It is within ~0.1f range, do stuff
        // }    
}

