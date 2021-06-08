using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Mapbox.Unity.Utilities;

public class Movement : MonoBehaviour
{
    //Vector3 Vec;
    public Rigidbody rb;
    public GameObject path;

    private GameObject tempPath;

    [SerializeField] int speed;
    [SerializeField] float radius;
    [SerializeField] List<GameObject> tempPathContainer = new List<GameObject>();
    [SerializeField] LayerMask pathMask;

    public Transform balloonPathCheck;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        if(Input.GetKey(KeyCode.P)) {
            tempPath = Instantiate(path, transform.position + new Vector3(10,10,0), transform.rotation) as GameObject;
            tempPathContainer.Add(tempPath);
        }

        if(tempPath != null) {
            Vector3 direction = (tempPath.transform.position - transform.position).normalized;
            rb.MovePosition(transform.position + direction * speed * Time.deltaTime);
        }
        
        // var worldPosition = Conversions.GeoToWorldPosition(51.485852, -113.146361, new Vector2d(10, 10), (float)2.5).ToVector3xz();
        // Vec = transform.localPosition;  
        // Vec.y += Input.GetAxis("Jump") * Time.deltaTime * 20;  
        // if(Input.GetKey(KeyCode.LeftShift)) 
        // {
        //     Vec.y -=  Time.deltaTime * 20;
        // }
        // Vec.x += Input.GetAxis("Horizontal") * Time.deltaTime * 20;  
        // Vec.z += Input.GetAxis("Vertical") * Time.deltaTime * 20;  
        // transform.localPosition = Vec; 
    }
}
