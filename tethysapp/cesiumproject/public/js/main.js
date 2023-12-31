//Author: Nash Euto
//Function: Handles all of the functions and events for the main page and the Cesium map on the page


//This project was made as a demo for a new API that is being tested in the CHL
//To change the members of a cesium object, you have to use dot notation to access the variables
//Often, defining new things to put into objects does not work because the fields of what you are creating already exist and should just be modified with dot notation
//For example, instead of making a new EntityCluster and then adding it to the source, all you need to do is use dot notation to modify the entity cluster that already exists at the conception of the object 
//The docs tell you the objects that already exist inside an object on its creation, not objects that you need to make yourself then add

$(function(){
  Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Y2M3NTVjOS05YmE2LTQyNmEtYjQ1MS1hODBlNWM1MmYwZTIiLCJpZCI6MTUwNTM1LCJpYXQiOjE2ODgxNTI4MzN9.yswdjP2gynH4ndTniyMFIJkCpkzpl7fePBeomQ_-WnY';
   
  //Used to send the get request
  function getValues(viewer, dict){
    //If a user selects something, it can only be a polygon or an icon. Icons always match lakes that have data, but polygons don't so we must check if they do
    let id = viewer.selectedEntity.id
    let entity = viewer.selectedEntity //Create a local variable so we can send the entity to the get request 
    //If the id is a string, a polygon was selected
    if(typeof(viewer.selectedEntity.id) == 'string'){
      id = viewer.selectedEntity.id.slice(16); //Cut out the id
      if(dict[id] != undefined){
        entity = dict[id];
      }
    }
      $.get(
        "/apps/cesiumproject/csvjson", //Send a get request to the dummy site so the controller will send the data over in a JsonResponse
        { id: entity.id}, //Send the ID to get data for the specific hydrograph
        function(data){
          if(data.flag){
            return false
          }
          var infoPromise = new Promise((resolve) => {
            //Our data is in a JSON - parse it to get the object
            var x_axis_object = JSON.parse(data['dateList']);
            var y_axis_object = JSON.parse(data['hydroPoints']);

            //The object holds values which are keyed by indexes. Get the values in an array
            var x_values = Object.values(x_axis_object);
            var y_values = Object.values(y_axis_object);
            
            //Store the graph data in the entity to use it in the creation of a CSV
            entity.properties['dates'] = x_values;
            entity.properties['values'] = y_values;

    
            var plotData = {
              x: x_values,
              y: y_values,
              type: 'scatter',
            };

            var header = document.getElementById('modal-header');
            var id = document.getElementById('id-block');
            var lonlat = document.getElementById('lonlat');
            var continent = document.getElementById('continent');
            var country = document.getElementById('country');
            var volume = document.getElementById('volume');
            var src = document.getElementById('src');
            var dis = document.getElementById('dis');
            var elevation = document.getElementById('elevation');
            var wshd = document.getElementById('wshd');
            var pLongLat = document.getElementById('pLongLat');
            var area = document.getElementById('area');
            var length = document.getElementById('length');
            var dev = document.getElementById('dev');
            var res = document.getElementById('res');
            var depth = document.getElementById('depth');
            var time = document.getElementById('time');
            var slope = document.getElementById('slope');
            
            var properties = entity.properties;

            //Configure the informtion for the modal
            Plotly.newPlot(document.getElementById('figure'), [plotData], layout, {responsive: true})
            header.innerHTML = '<h3>' + entity.name + '</h3>';
            id.innerHTML = '<h6>' + 'ID: ' + entity.id + '</h6>';
            lonlat.innerHTML = '<h6>' + 'Coordinates: (' + properties['lat'] + ', ' + properties['lon'] + ')' + '</h6>';
            continent.innerHTML = '<h6>' + 'Continent: ' + properties['continent'] + '</h6>';
            country.innerHTML = '<h6>' + 'Country: ' + properties['country'] + '</h6>';
            volume.innerHTML = '<h6>' + 'Volume: ' + properties['vol'] + '</h6>';
            src.innerHTML = '<h6>' + 'Src: ' + properties['src'] + '</h6>';
            dis.innerHTML = '<h6>' + 'Dis: ' + properties['dis'] + '</h6>';
            elevation.innerHTML = '<h6>' + 'Elevation: ' + properties['elevation'] + '</h6>';
            wshd.innerHTML = '<h6>' + 'Watershed: ' + properties['wshd'] + '</h6>';
            pLongLat.innerHTML = '<h6>' + 'Pour Coordinates: (' + properties['pourLat']+ ', ' + properties['pourLong'] + ')' + '</h6>';
            area.innerHTML = '<h6>' + 'Area: ' + properties['area'] + '</h6>';
            length.innerHTML = '<h6>' + 'Length: ' + properties['len'] + '</h6>';
            dev.innerHTML = '<h6>' + 'Dev: ' + properties['dev'] + '</h6>';
            res.innerHTML = '<h6>' + 'Res: ' + properties['res'] + '</h6>';
            depth.innerHTML = '<h6>' + 'Depth: ' + properties['depth'] + '</h6>';
            time.innerHTML = '<h6>' + 'Time: ' + properties['time'] + '</h6>';
            slope.innerHTML = '<h6>' + 'Slope: ' + properties['slope'] + '</h6>';
            resolve();
          });
          
          //Once all of the info collecting is done, show the modal
          infoPromise.then(() => {
            $('#exampleModal').modal('show');
          });
          return true
        },
        'json');
    }

  //Change the dropdown box back to point
  $('#draw-options option[value="1"]').attr('selected', true)

  //Draw a point on double-click
  
  
  //Grab the arrays from the data in the html file
  var latList = myData.lat;
  var longList = myData.long;
  var nameList = myData.nameList;
  var idList = myData.id;
  var countryList = myData.country;
  var continentList = myData.continent
  var pLatList = myData.pour_lat;
  var pLongList = myData.pour_long;
  var areaList = myData.lake_area;
  var lenList = myData.shore_len;
  var devList = myData.shore_dev;
  var totalVolList = myData.vol_total;
  var resTotalList = myData.vol_res;
  var srcTotalList = myData.vol_src;
  var depthList = myData.depth_avg;
  var disList = myData.dis_avg;
  var timeList = myData.res_time;
  var elevationList = myData.elevation;
  var slopeList = myData.slope_100;
  var wshdList = myData.wshd_area;
  var typeList = myData.lake_type;
  var surfaceData = JSON.parse(myData.surface_data); //Contains the last value for each lake from the CSV

  var boundRect = new Cesium.Rectangle();
  var rect = new Cesium.Rectangle()

  //Create the source that will hold the entities and the clustering information 
  //NOTE: Clustering works poorly in 3D and works very poorly in 2D
  var polySource = new Cesium.GeoJsonDataSource("Poly");
  var source = new Cesium.CustomDataSource("Lakes");
  //NOTE: To access the fields in cesium objects, the best way to do it is to use dot notation like in the clustering below 46.7386%2C36.5712%2C54.0525%2C47.1308
  //source.clustering.enabled = true; //Enables clustering with default values

  //Creates the map
  const viewer = new Cesium.Viewer('map', {
    //Disable the clock and the timeline
    animation: false,
    timeline: false,
    //NOTE: name, id, and description are the only fields that affect what shows up in the infobox
    infoBox: false,
    scene3DOnly: true,
    //Change the imagery provider because the default bing maps has limited monthly uses (1000)
    imageryProvider: new Cesium.IonImageryProvider({assetId: 3954}),
  });

  //Remove interactions by accessing the screenSpaceEventHandler and removing input actions. This removes the zoom in caused by a double click
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_DOWN);
  //Set right click to draw points by default
  viewer.screenSpaceEventHandler.setInputAction(pointHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  //Remove the ability to pan the camera to prevent the user from expanding the view box beyond intended
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  
  let idDict = {}; //Used to key ids with entities
  pin = new Cesium.PinBuilder();
  for (i = 0; i < latList.length; i++){
    entity = new Cesium.Entity({
      id: idList[i],
      name: nameList[i],
      position: Cesium.Cartesian3.fromDegrees(longList[i], latList[i]),
      properties: {
        id: idList[i],
        name: nameList[i], 
        lon: longList[i].toFixed(2),
        lat: latList[i].toFixed(2),
        country: countryList[i],
        continent: continentList[i],
        pourLong: pLongList[i],
        pourLat: pLatList[i],
        area: areaList[i],
        len: lenList[i],
        dev: devList[i],
        vol: totalVolList[i],
        res: resTotalList[i],
        src: srcTotalList[i],
        depth: depthList[i],
        dis: disList[i],
        time: timeList[i],
        elevation: elevationList[i],
        slope: slopeList[i],
        wshd: wshdList[i],
        dates: [],
        values: [],
      },
    });

    //Lake type 1 is a point, 2 is a box, and 3 is a polygon (shaped as a triangle)
    switch(typeList[i]){
      case 1:
        const circlePin = new Promise((resolve) => {
          entity.billboard = ({
            image: pin.fromMakiIconId('circle', Cesium.Color.RED, 20),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          });
          resolve();
        });
        circlePin.then(source.entities.add(entity));
        break;
      case 2:
        const boxPin = new Promise((resolve) => {
          entity.billboard = ({
            image: pin.fromMakiIconId('square', Cesium.Color.BLUE, 20),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          });
          resolve();
        });
        boxPin.then(source.entities.add(entity));
        break;
      case 3:
        const trianglePin = new Promise((resolve) => {
          entity.billboard = ({
            image: pin.fromMakiIconId('triangle', Cesium.Color.GREEN, 20),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          });
          resolve();
        });
        trianglePin.then(source.entities.add(entity));
        break;
    }
    //As you approach 100000 meters, the icon's size is doubled. As you zoom out towards 1000000 meters, the icons sized is halved
    entity.billboard.scaleByDistance = new Cesium.NearFarScalar(100000, 2, 1000000, .5);
    idDict[entity.id] = entity;
  } 

  //Add the dataSource directly to the map's dataSources. Layers are not needed
  viewer.dataSources.add(source);
  viewer.dataSources.add(polySource);

  //Layout for the plotly graph
  var layout = {
    automargin: false,
    margin: {
      l: 50,
      r: 30,
      b: 40,
      t: 30,
      pad: 0,
    },
    width: window.innerWidth*.45,
    height: 210,
    yaxis: {
      title: 'Surface Area (m^2)',
    },
    xaxis: {
      title: 'Time (time)',
    },
  }

  //When the camera stops moving, check its height. If below a certain distance, render polygons in the viewbox
  viewer.camera.moveEnd.addEventListener(() => {
    if((Cesium.Cartographic.fromCartesian(viewer.camera.position).height) / 1000 > 300){
    } else {
      //Generate a rectangle that is the bounds of the view
      view = viewer.camera.computeViewRectangle();
      
      //get the bounds of the view needed to compute a bounding box
      var nw = Cesium.Rectangle.northwest(view);
      var sw = Cesium.Rectangle.southwest(view);
      var se = Cesium.Rectangle.southeast(view);
      var maxLat, minLat, maxLong, minLong;

      if(nw.latitude > sw.latitude){
        maxLat = nw.latitude;
        minLat = sw.latitude;
      } else {
        maxLat = sw.latitude;
        minLat = nw.latitude;
      }
      if(sw.longitude > se.longitude){
        maxLong = sw.longitude;
        minLong = se.longitude;
      } else {
        maxLong = se.longitude;
        minLong = sw.longitude;
      }

      bboxArray = [minLong, minLat, maxLong, maxLat];

      //Covert from radians to degrees
      for(let i = 0; i < bboxArray.length; i++){
        bboxArray[i] = bboxArray[i] * (180/Math.PI);
      }
      //Join the bound into a string, delimited by commas (2%C in urls) and put it into the geoserver filters
      bboxString = bboxArray.join('%2C');
      boundRect = new Cesium.Rectangle(nw.longitude, sw.latitude, se.longitude, nw.latitude);

      /* ----- Code below refactored by Alex Burrell, in process of adding logarithmic scaling to lake heights -----
         -----         Mostly replaced Object internals with official APIs for getting values                  -----
         -----                Example: replace '._entityCollection' with '.entities'                           ----- */

      //If there is no intersection with the bounding box, use the procecss function (which does not replace everything) to get the polygons
      if(Cesium.Rectangle.intersection(rect, boundRect) != null){
        viewer.dataSources.get(1).process('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson');
        // console.log('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson');
        var loaded = viewer.dataSources.get(1).entities.values;
        //If the entities loaded in from the webserver have ids that match those in the CSV, change the height of the polygons to match the value in the CSV
        for(let i = 0; i < loaded.length; i++){
          var id = loaded[i]['id'].slice(loaded[i]['id'].indexOf('.') + 1); //Slice to obtain the integer from the ID
          if(surfaceData.hasOwnProperty(id)){
            loaded[i].polygon.extrudedHeight = surfaceData[id];
          }
        }
      } else {
        //Same as above except load wipes all of the existing entities 
        rect = boundRect
        viewer.dataSources.get(1).load('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson');
        var loaded = viewer.dataSources.get(1).entities.values;
        for(let i = 0; i < loaded.length; i++){
          var id = loaded[i]['id'].slice(loaded[i]['id'].indexOf('.') + 1);
          if(surfaceData.hasOwnProperty(id)){
            loaded[i].polygon.extrudedHeight = surfaceData[id];
          }
        }
      }
      /* Below, loop through the entire loaded array, normalizing the heights
       * According to the formula 'final_height = log(height - base) + base' where height = the extrudedHeight,
       * base = some random baseline height chosen by us not to normalize, and final_height = the extruded height of the polygon after running this code
       * Code added by Alex
       * TODO: Finish this! 8/11/23
       */
      if(loaded.length > 0) {
      console.log("The length of loaded is " + String(loaded.length)); } //  + ', and the height of loaded[0] is ' + String(loaded[0].polygon.extrudedHeight.getValue())); }
      
      let baseHgt = 4000;
      for(let i = 0; i < loaded.length; i++) {
        try {
        let polHgt = loaded[i].polygon.extrudedHeight.getValue();
        console.log('We succeeded, men! The new polygon height is ' + String(polHgt));
        if(polHgt > baseHgt) {
          polHgt = Math.log2(polHgt - baseHgt) + baseHgt;
        } }
        catch(e) { console.error('We failed men: ' + String(e.message + '. On iteration ' + String(i)) + '; the lake\'s id is ' + loaded[i].properties.Hylak_id._value); }
      }
    }
  });

  //selectedEntityChanged is an event that fires when entities are selected OR unselected
  //Look for the class js-plotly-plot on the id. If it exists, reformatting the graph instead of generating a new one is more efficient
  viewer.selectedEntityChanged.addEventListener(function(){
    //A try is necessary because, when entities are unselected, the event is still fired and throws an error
    try{
      if(typeof(viewer.selectedEntity['id']) != 'string'){
        getValues(viewer, idDict);
      } else {
        if(typeof(viewer.selectedEntity['id']) != undefined){
          if(!getValues(viewer, idDict)){
            viewer.selectedEntity = undefined;
          }
        }
        
      }
      //Do nothing if there is not a selected entity or if there is any other issue
    } catch {}
  });
  
  //When the window is resized, adjust the width of the plotly graph in the modal
  window.addEventListener('resize', () => {
    try{
      plot = document.getElementById('figure');
      if(plot.classList.contains('js-plotly-plot')){
        Plotly.relayout(plot, {
          //Size the plotly graph according to the width of the modal
          width: document.getElementById('modal-header').offsetWidth,
        });
      }
    } catch {}
  });

  //When the modal is rendered, configure the graph to fit the width
  $('#exampleModal').on('shown.bs.modal', () => {
    Plotly.relayout(document.getElementById('figure'),{
      width: document.getElementById('modal-header').offsetWidth,
      //autorange: true ensures the graph will reset its view when another modal is created
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
  });

  //Allows the reselection of a point after closing the modal. Also removes the selectionIndicator
  $('#exampleModal').on('hidden.bs.modal', () => {
    viewer.selectedEntity = undefined;
  });

  //Creates a pdf in a new tab on click
  $('#pdf-button').click(() => {
    //Create a jsPDF to make the PDF
    var pdf = new jspdf.jsPDF();
    var properties = viewer.selectedEntity.properties;
    var propertyArray = viewer.selectedEntity.properties.propertyNames;
    var textArray = []
    //Push the properties into an array for the PDF
    for(let i = 0; i < propertyArray.length - 2; i++){
      textArray.push(propertyArray[i] + ': ' + String(Object.values(properties[propertyArray[i]])[0]));
    } 
    pdf.setFont('Times-Roman');
    pdf.text(textArray, 20, 20);
    //Add the plotly chart to the pdf
    Plotly.toImage(document.getElementById('figure'), {format: 'jpeg', width: 400, height: 300}).then(function(dataUrl) {
      pdf.addImage(dataUrl, 'JPEG', 75, 65, 125, 75);
      pdf.output('dataurlnewwindow');
    });
  });

  //Creates and downloads a CSV on click
  $('#csv-button').click(() => {
    dateArray = viewer.selectedEntity.properties['dates'];
    valueArray = viewer.selectedEntity.properties['values'];

    var csvArray = [
      [dateArray], 
      [valueArray], 
    ];

    //Create a string delimited by commas to represent the CSV data
    let res = ""
    csvArray.forEach((row) => {
      res += row.join(",") + '\n';
    });

    //Create the csv file using Blob and create a url for the file
    const file = new Blob([res], {type: 'text/csv'});
    const url = URL.createObjectURL(file);

    //Set the CSV's a element to download the file
    linkWrapper = document.getElementById('csv-link');
    linkWrapper.setAttribute('href', url);
    document.getElementById('csv-link').click();
    linkWrapper.removeAttribute('href');

    //Delete the values stored in the entity to save memory
    viewer.selectedEntity.properties['dates'] = [];
    viewer.selectedEntity.properties['values'] = [];
  });

  //Variables for the drawing interactions
  let placedPointList = []; //Used to draw polygon
  let movingPoint; //Point at mouse position
  let dynamicShape; //Shape or line user draws
  let mode;

  function pointHandler(click){
    //The position click holds is based on the view frame, not the position on the map
    const ray = viewer.camera.getPickRay(click.position);
    const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);

    viewer.entities.add(new Cesium.Entity({
      position: earthPosition,
      point: new Cesium.PointGraphics({
        color: Cesium.Color.YELLOW,
        pixelSize: 4,
      }),
    }));
  }

  //MOST OF THIS SECTION IS NOT MY CODE
  //The following code was taken from the cesium drawing tutorial. It is possible to do, but not very straightforward so I had a hard time trying to make it myself and instead copied it. 

  //Creates a point based off of a passed position
  function createPoint(myPosition){
    const point = viewer.entities.add({
      position: myPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    return point;
  }

  //Draws a line or polygon based on the mode
  function drawShape(myPositions){
    let shape;
    if(mode == "line"){
      shape = viewer.entities.add({
        polyline: {
          positions: myPositions,
          clampToGround: true,
          width: 3,
        },
      });
    } else if(mode == "poly" || mode == "square") {
      shape = viewer.entities.add({
        polygon: {
          hierarchy: myPositions,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.WHITE.withAlpha(0.7),
          ),
        },
      })
    }
    return shape
  }

  //Handles clicks to assign polygon points
  function clickHandler(event){
    const ray = viewer.camera.getPickRay(event.position);
    const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
    // `earthPosition` will be undefined if our mouse is not over the globe.
    if(Cesium.defined(earthPosition)){
      if (placedPointList.length === 0) {
        movingPoint = createPoint(earthPosition);
        placedPointList.push(earthPosition);
        const dynamicPositions = new Cesium.CallbackProperty(function () {
          if (mode === "poly") { 
            return new Cesium.PolygonHierarchy(placedPointList);
          }
          return placedPointList;
        }, false);
        dynamicShape = drawShape(dynamicPositions);
      }
      placedPointList.push(earthPosition);
      createPoint(earthPosition);
    }
  }

  //Handles the mouse movement. 
  function moveHandler(event){
    //Get mouse position
    if(Cesium.defined(movingPoint)){ 
      const ray = viewer.camera.getPickRay(event.endPosition);
      const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
      //If the mouse position is defined, adjust the location of the moving point to the mouse position and adjust the placedPointList to reflect the changes
      if(Cesium.defined(newPosition)){
        movingPoint.position.setValue(newPosition);
        placedPointList.pop();
        placedPointList.push(newPosition); //Needed because the polygon hierarchy is based on this list so it needs to change
      }
    }
  }

  //Draw the polygon, remove the moving points and the dynamic shape, and reset all of the variables to undefined
  function terminate(){
    placedPointList.pop(); //pop off dynamic point
    drawShape(placedPointList);
    viewer.entities.remove(movingPoint);
    viewer.entities.remove(dynamicShape);
    movingPoint = dynamicShape = squarePointOne = squarePointTwo = undefined;
    placedPointList = [];
  }

  function middleHandler(){
    terminate();
  }

  //BACK TO MY OWN CODE

  //My girlfriend came up with the rectangle vertices idea and wants credit here
    let cameraStart, cameraEnd;
    let squareStart;
    let squarePointOne, squarePointTwo;
    let rectangle;
    let dynamicPositions;
    let minPixelY, maxPixelY, minPixelX, maxPixelX;
    
    //Function for the callback in the squareClickHandler. Allows corners to be dynamic
    function getCornerLocations(){
      return [squarePointOne.position.getValue(), movingPoint.position.getValue(), squarePointTwo.position.getValue(),squareStart.position.getValue(),];
    }

    //BUG: When you left click when the multi-select is active, the two supporting points lock in their longitude or latitude and mess up the square. Selection still functions properly though
    //BUG: Clicking again after moving the mouse throws an error
    //NOTE: Conforms to the curvature of the globe. Not a straight rectangle so selection can get weird the further zoomed out you are
    //Handler for the multi select interaction. Creates the points that define the corners of the selection and the polygon for the highlighting
    function squareClickHandler(event){
      //Get the position of the click based on the event position and the globe's ellipsoid
      var tempEllipsoid = viewer.camera.pickEllipsoid(
        event.position,
        viewer.scene.globe.ellipsoid,
      );
      if(Cesium.defined(tempEllipsoid)){
        cameraStart = event.position;
        viewer.scene.screenSpaceCameraController.enableInputs = false; //Disable camera movement
        //If squareStart, the initial click position, is undefined, create the corner points and create a polygon with a callback allowing it to have dynamic sizing
        if(squareStart == undefined) {
          cartographicSquareStart = Cesium.Cartographic.fromCartesian(tempEllipsoid);
          squareStart = createPoint(tempEllipsoid);
          squarePointOne = createPoint(tempEllipsoid); 
          squarePointTwo = createPoint(tempEllipsoid);
          movingPoint = createPoint(tempEllipsoid);
          dynamicPositions = new Cesium.CallbackProperty(function() { //Callback function is called a lot. Don't know what it's based off of but is fast enough for having a smooth selection polygon
            return new Cesium.PolygonHierarchy(getCornerLocations());
          }, false);
          dynamicShape = drawShape(dynamicPositions);
        } else {
          //If it is the second click, get all of the points within the users rectangle
          const entityArray = viewer.dataSources.get(0).entities.values;
          for(let i = 0; i < entityArray.length; i++){ //Inefficient loop through every entity, but it works
            var cartesian = entityArray[i].position.getValue().clone();
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //If the cartographic points of the entity fall within the rectangle, log them for now
            if(Cesium.Rectangle.contains(rectangle, cartographic)){
              console.log(entityArray[i]);
            }
          }
          squareTerminate(); //Remove entities and reset values to undefined
          viewer.scene.screenSpaceCameraController.enableInputs = true; //Allow input again
        }
      }
    }

    //Handles when the mouse moves. If it is on a defined point on the map, determine point location and reassign point positions
    let topRight, topLeft, bottomRight, bottomLeft;
    function squareMoveHandler(event){
      //Get mouse position
      if(Cesium.defined(movingPoint)){
        var tempEllipsoid = viewer.camera.pickEllipsoid(
          event.endPosition,
          viewer.scene.globe.ellipsoid,
        );
        //If position is defined, determine dimensions and how to structure the selection rectangle
        if(Cesium.defined(tempEllipsoid)){
          movingPoint.position.setValue(tempEllipsoid); //Set moving point to mouse position
          cameraEnd = event.endPosition;
          
          if(cameraEnd['x'] > cameraStart['x']){
            maxPixelX = cameraEnd['x'];
            minPixelX = cameraStart['x'];
          } else {
            maxPixelX = cameraStart['x'];
            minPixelX = cameraEnd['x'];
          }
          if(cameraEnd['y'] > cameraStart['y']){
            maxPixelY = cameraEnd['y'];
            minPixelY = cameraStart['y'];
          } else {
            maxPixelY = cameraStart['y'];
            minPixelY = cameraEnd['y'];
          }
          topRight = viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(maxPixelX, minPixelY),
            viewer.scene.globe.ellipsoid
          );
          topLeft = viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(minPixelX, minPixelY),
            viewer.scene.globe.ellipsoid
          );
          bottomRight = viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(maxPixelX, maxPixelY),
            viewer.scene.globe.ellipsoid
          );
          bottomLeft = viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(minPixelX, maxPixelY),
            viewer.scene.globe.ellipsoid
          );
          if(Cesium.defined(topRight) && Cesium.defined(topLeft) && Cesium.defined(bottomRight) && Cesium.defined(bottomLeft)){
            //Check to see what corner the mouse is on. Based on the mouse, assign the other corners of the rectangle
            if(Cesium.Cartesian3.equals(tempEllipsoid, topRight)){
              squarePointOne.position.setValue(bottomRight);
              squarePointTwo.position.setValue(topLeft);
            }
            if(Cesium.Cartesian3.equals(tempEllipsoid, topLeft)){
              squarePointOne.position.setValue(topRight);
              squarePointTwo.position.setValue(bottomLeft);
            }
            if(Cesium.Cartesian3.equals(tempEllipsoid, bottomRight)){
              squarePointOne.position.setValue(topRight);
              squarePointTwo.position.setValue(bottomLeft);
            }
            if(Cesium.Cartesian3.equals(tempEllipsoid, bottomLeft)){
              squarePointOne.position.setValue(topLeft);
              squarePointTwo.position.setValue(bottomRight);
            }
            //Creeate a rectangle based off of the longitude and latitude of the corners of the rectangle. Represents area inside selection rectangle when user draws
            var northwest = Cesium.Cartographic.fromCartesian(topLeft);
            var southeast = Cesium.Cartographic.fromCartesian(bottomRight);
            rectangle = new Cesium.Rectangle(northwest.longitude, southeast.latitude, southeast.longitude, northwest.latitude);
          }
        }
      }
    }

    //Remove the point entities and the polygon from the map. Set all of the values to undefined
    function squareTerminate(){
      viewer.entities.remove(dynamicShape);
      viewer.entities.remove(squareStart);
      viewer.entities.remove(squarePointOne);
      viewer.entities.remove(squarePointTwo);
      viewer.entities.remove(movingPoint);
      squareStart = squarePoint = squarePointOne = squarePointTwo = movingPoint = rectangle = dynamicShape = cartographicSquareStart = undefined;
    }

  //When an option in the dropdown on the top left of the map is selected, run through the switch and assign the necessary click interactions
  $('#draw-options').change(function(){
    switch($(this).val()){
      case '1':
        if(placedPointList.length != 0){
          terminate();
        }
        viewer.screenSpaceEventHandler.setInputAction(pointHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
        break;
      case '2': 
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'line';
        viewer.screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(middleHandler, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
        break;
      case '3':
        if(placedPointList.length != 0){
          terminate();
        } 
        mode = 'poly';
        viewer.screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(middleHandler, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
        break;
      case '4':
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'square';
        viewer.screenSpaceEventHandler.setInputAction(squareClickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(squareMoveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
    }
  })

  globView = viewer; // Line added by Alex, done so I can access the viewer object from global scope
});
  

// This section was done by Alex Burrell, all above by Nash except for line globView
function flyToCoordinates() {

  let XCoordNum = +$('#XCoord')[0].value;
  let YCoordNum = +$('#YCoord')[0].value;
  
  if(isNaN(XCoordNum) || isNaN(YCoordNum)) {
    alert("Please enter only digits, no letters.");
    return false;
  }
  else if(!XCoordNum || !YCoordNum) { // Easy way to check if either are zero, which indicates they left a field blank
    alert("Please don't leave a field blank");
    return false;
  }
  globView.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(XCoordNum, YCoordNum, 40000),
  })

  return false;
}

function flyToID() {
  let pointID = Number($('#pointID')[0].value);
  if(isNaN(pointID)) {
    alert("Please enter only digits, no letters.");
    return false;
  }

  // Given the point ID above, go find the point that corresponds to it.
  // Working middle of this had to leave, REFACTOR!
  if(!myData.id.includes(pointID)) {
    alert("Point with ID " + String(pointID) + " not found.");
    return false;
  }

  // This whole section all the way to return false is horrible & inefficient, must refactor later
  let indexOfPoint = myData.id.indexOf(pointID);
  let daDataSource = globView.dataSources.getByName("Lakes")[0];

  let XCoordNum = Number(myData.long[indexOfPoint]);
  let YCoordNum = Number(myData.lat[indexOfPoint]);

  // Snag the entity those coordinates correspond to so we can set it to the selected entity
  let toBeSelectedEnt = daDataSource.entities.values[indexOfPoint];

  globView.selectedEntity = toBeSelectedEnt;
  globView.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(XCoordNum, YCoordNum, 3300000) });

  return false;
}

function addImg() {
  try{
  addHydroImg('http://localhost:8000/static/cesiumproject/images/Prado2010_Sep262022_wHS_Jan17_BF5.2_STREAM_LOSS.png',
  {"northing": 3805388.195347, "southing": 3724888.195347, "easting": 515053.934429, "westing": 417303.934429,
  "run_path": "Prado/Jan17_2010-Jan31_2010/Prado2010_Sep262022_wHS_Jan17_BF5.2_STREAM_LOSS", "epsg": 32611});
  } catch(e) { console.log(e.message); }
}

// Section also done by Alex Burrell, started week of July 31

function addHydroImg(imgURL, JSONCoord) {
  if(typeof(imgURL) != 'string') {
    throw new TypeError('imgURL must be a string!');
  }
  
  let epsgType = JSONCoord.epsg;
  const epsgStr = String(epsgType);

  // Check to see if the numbers of digits is equal to five, the first 2 are 32, and the last two are in the range 0 <= X <= 60
  // If not, throw an error
  if(epsgStr.length != 5 || epsgStr.slice(0,2) != "32" || Number(epsgStr.slice(-2)) > 60) {
    console.error('Length: ' + epsgStr.length + ', 1st 2 digits: ' + epsgStr.slice(0,2) + ', last 2 digits: ' + epsgStr.slice(-2));
    throw new Error('EPSG coordinates are not of type UTM');
  }

  // Kill 2 birds w/ 1 stone: Determine if we're doing UTM north or south, and also do error checking
  let nOrS = null; // north Or South
  if(epsgStr[2] == '6') { nOrS = ''; } 
  else if(epsgStr[2] == '7') { nOrS = ' +south'; }
  else { throw new Error('WGS Ver. must be WGS-84'); }

  // Proj4 returns results as an [x, y] array, also parameter passing is weird; attributes/flags are passed as string fields '+attribute=value', not object fields
  let northE = proj4('+proj=utm +zone=' + epsgStr.slice(-2) + nOrS, 'EPSG:4326', [JSONCoord.easting, JSONCoord.northing]);
  let southW = proj4('+proj=utm +zone=' + epsgStr.slice(-2) + nOrS, 'EPSG:4326', [JSONCoord.westing, JSONCoord.southing]);

  // Locations in array: [west, south, east, north]
  let arr = southW.concat(northE);

  // Corners: WS, WN, EN, ES
  let plygnHier = [degreeToCar3(arr[0], arr[1]), degreeToCar3(arr[0], arr[3]), degreeToCar3(arr[2], arr[3]), degreeToCar3(arr[2], arr[1])];

  let plygnImgBase = new Cesium.PolygonGraphics({
    show: true,
    hierarchy: plygnHier,
    material: new Cesium.ImageMaterialProperty({ image: imgURL, transparent: true}),
    extrudedHeight: 100,
    closeTop: true,
    closeBottom: false,
  });

  globView.entities.add({
    description: '',
    polygon: plygnImgBase,
  });
}

function addLayerFromURL() {
  let URL = $("#Layer_URL")[0].value;

  /* Old style (by old I mean that I tried 1st) way of doing it:
   * globView.imageryLayers.add(layerToAdd);
   * Unfortunately, this has the side effect of breaking the baseLayerPicker widget
   * The 2nd way (below) doesn't do that
   */

  globView.baseLayerPicker.viewModel.imageryProviderViewModels.push(new Cesium.ProviderViewModel({
    name: 'Custom Map No. ' + String(globView.baseLayerPicker.viewModel.imageryProviderViewModels.length - 12), // has to be minus 12, since length isn't incremented until the push method finishes executing, so it always reads as n-1, where n is the number of times push has been called
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Globe-Africa-and-Europe%26Asiaparts.svg/512px-Globe-Africa-and-Europe%26Asiaparts.svg.png?20180429185850', // Image license: CC-BY-4.0
    tooltip: 'Custom map added via the URL field',
    creationFunction: function() {
      return new Cesium.UrlTemplateImageryProvider({
        url: URL,
        credit: new Cesium.Credit('<span>Credit for this map goes to </span><a href="https://' + getURLhostname(URL) + '/" target="_blank"><span style="color: blue;">this link.</span></a>', true),
        enablePickFeatures: false,
      }
    )}
  }));

  return false;
}

// Wrapper function around Cesium.Cartesian3.fromDegrees(), to save me typing
function degreeToCar3(x, y) {
  return Cesium.Cartesian3.fromDegrees(x, y, 20);
}

// Wrapper function around the URL constructor to avoid name collision with the URL variable above, also so we aren't cluttering up the Credit constructor
function getURLhostname(urlParam) {
  return new URL(urlParam).hostname.toString();
}

/* Cesium seems to natively support gltf models
 * They mention here: (https://cesium.com/learn/3d-tiling/ion-tile-3d-models/) that Cesium also supports other formats
 * Namely, Wavefront Objs, Filmbox, & Digital Asset Exchange 
 */
async function create3DModel() {
  gltfMdl = Cesium.Model.fromGltfAsync({
    url: 'http://localhost:8000/static/cesiumproject/models/CesiumHouse.glb', // gltf & glb are both Graphics Library Transmission Formats (as far as I can tell)
    show: true,
    scale: 1.0,
    minimumPixelSize: 128,
    maximumPixelSize: 2000,
    asynchronous: true,
    credit: '<div><a href="https://opengameart.org/content/rpg-item-collection-3">RPG Item Collection 3</a>, by Drummyfish on Open Game Art.</div>',
    gltfCallback: (gltfObj) => { console.log('The gltf object was successfully loaded'); }
  });
  return await gltfMdl;
}


// https://web.archive.org/web/20150316212437/http://cesiumjs.org/2014/03/03/Cesium-3D-Models-Tutorial/
function load3DModel() {
  var frank = globView.entities.add({
    name: 'Model of House',
    position: Cesium.Cartesian3.fromDegrees(25, 25, 0),
    model: create3DModel()
  });
  // globView.trackedEntity = frank;
}

/* TODO:
 * 1) Add in a generic *ADD URL* text field to add a layer to the Cesium map - ✓
 * 2) Add in a text field to fly to a node with a specific ID - ✓
 * 3) Add lake polygons with heights that grow logarithmically, aka normalize them (Gene will send link) - X
 * 4) Dive into the time step functionality (aka, try it out) - X
 * 5) Dive into 3D files that work w/ Cesium & Make a 3D file - X
 * 6) Comment my code - X
 */
