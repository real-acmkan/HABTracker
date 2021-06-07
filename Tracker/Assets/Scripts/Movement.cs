using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mapbox.Unity.Utilities;

public class Movement : MonoBehaviour
{
    Vector3 Vec;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
        // var worldPosition = Conversions.GeoToWorldPosition(51.485852, -113.146361, new Vector2d(10, 10), (float)2.5).ToVector3xz();
        Vec = transform.localPosition;  
        Vec.y += Input.GetAxis("Jump") * Time.deltaTime * 20;  
        if(Input.GetKey(KeyCode.LeftShift)) 
        {
            Vec.y -=  Time.deltaTime * 20;
        }
        Vec.x += Input.GetAxis("Horizontal") * Time.deltaTime * 20;  
        Vec.z += Input.GetAxis("Vertical") * Time.deltaTime * 20;  
        transform.localPosition = Vec; 
    }
}
