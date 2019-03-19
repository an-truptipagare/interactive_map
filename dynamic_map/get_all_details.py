import json
import shapely
from shapely.geometry import shape, Point,Polygon
# from topojson.conversion import convert
# from topojson import geojson
import json
import os
# __file__ refers to the file settings.py 
APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')

# Get all details for particular coordinates
def get_info(state_name,longitude,latitude):
    print(os.getcwd())
    file_names = ["upper_sld", "lower_sld", "sub_counties", "places","school_d","elementary_school_d","secondary_school_d","concity"]
    response = {}
    for file_name in file_names :
        # load GeoJSON file containing sectors
        if(os.path.isfile(os.path.join('static/geojson/'+state_name+'/'+file_name+'.json'))):
            with open(os.path.join('static/geojson/'+state_name+'/'+file_name+'.json')) as f:
                js = json.load(f)
            # print(js)
            # construct point based on lon/lat returned by geocoder
            longitude = float(longitude)
            latitude = float(latitude)
            point = Point(longitude,latitude)

            # check each polygon to see if it contains the point
            for feature in js['features']:
                # print(feature['geometry'])
                print(type(feature['geometry']))
                polygon = shape(feature['geometry'])
                print(type(polygon))
                print(polygon.contains(point))
                if polygon.contains(point):
                    # print('Found containing polygon:', feature['properties']['NAMELSAD'])
                    if file_name not in response:
                        if 'NAMELSAD' in feature['properties']:
                            response[file_name] = feature['properties']['NAMELSAD']
                        else:
                            response[file_name] = feature['properties']['NAME']
                    else:
                        if 'NAMELSAD' in feature['properties']:
                            response[file_name] = response[file_name]+","+feature['properties']['NAMELSAD']
                        else:
                            response[file_name] = response[file_name] + "," + feature['properties']['NAME']

    if (os.path.isfile(os.path.join('static/geojson/zip_codes.json'))):
        with open(os.path.join('static/geojson/zip_codes.json')) as f:
            js = json.load(f)
            # print(js)
            # construct point based on lon/lat returned by geocoder
            longitude = float(longitude)
            latitude = float(latitude)
            point = Point(longitude,latitude)
            # check each polygon to see if it contains the point
            for feature in js['features']:
                # print(feature['geometry'])
                print(type(feature['geometry']))
                polygon = shape(feature['geometry'])
                print(type(polygon))
                print(polygon.contains(point))
                if polygon.contains(point):
                    response["zip_code"] = feature['properties']['ZCTA5CE10']
    if (os.path.isfile(os.path.join('static/geojson/congressional_district.json'))):
        with open(os.path.join('static/geojson/congressional_district.json')) as f:
            js = json.load(f)
            cd_records = []
            for feature in js['features']:
                polygon = shape(feature['geometry'])
                print(type(polygon))
                print(polygon.contains(point))
                if polygon.contains(point):
                    response["congress_d"] = feature['properties']['NAMELSAD']
    print(response)
    return response


#Get Congressional District data
def get_congressional_data(state_fp):
    if (os.path.isfile(os.path.join('static/geojson/congressional_district.json'))):
        with open(os.path.join('static/geojson/congressional_district.json')) as f:
            js = json.load(f)
            cd_records = []
            for feature in js['features']:
                if feature['properties']['STATEFP'] == state_fp:
                    cd_records.append(feature)
    return cd_records

#Get zip codes data
def get_zipcode_data(state_fp):
    zip_records = []
    if (os.path.isfile(os.path.join('static/geojson/states.json'))):
        with open(os.path.join('static/geojson/states.json')) as f:
            js = json.load(f)
            for feature in js['features']:
                # Get states polygon
                if feature['properties']['STATEFP'] == state_fp:
                    state_polygon = shape(feature['geometry'])
                    if (os.path.isfile(os.path.join('static/geojson/zip_codes.json'))):
                        with open(os.path.join('static/geojson/zip_codes.json')) as f:
                            js1 = json.load(f)                            
                            for feature1 in js1['features']:
                                polygon = shape(feature1['geometry'])                   
                                if state_polygon.intersects(polygon) or state_polygon.crosses(polygon) or state_polygon.contains(polygon):
                                    zip_records.append(feature1)
                    break
    return zip_records
