import os
import time
import pandas as pd
import numpy as np
from flask import Flask, session, redirect, url_for, escape, request,jsonify,json
from flask_restful import Resource, Api, reqparse
from flask_restplus import Namespace, Resource, fields
from flask_cors import CORS
from flask import render_template
import dynamic_map

app = Flask(__name__, template_folder='../templates')
app = Flask(__name__, static_folder='../static')
app = Flask(__name__, static_url_path='')
app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)

app.secret_key = '23726472364'
# api = Api(app, version='1.0', title='Tf Api',description='An Api for Tensorflow')


@app.route("/")
def index():
    return render_template("leaflet_map.html")

@app.route("/get_details",methods = ['POST'])
def get_zipcode_details(): 
    print("We are into function..")
    # print(request.json)
    parser = reqparse.RequestParser()
    parser.add_argument("state_name")
    parser.add_argument("longitude")
    parser.add_argument("latitude")
    args = parser.parse_args()
    state_name = args["state_name"]
    longitude = args["longitude"]
    latitude = args["latitude"]
    print(state_name,longitude,latitude)
    response = dynamic_map.get_info(state_name,longitude,latitude)
    return json.dumps(response),200

@app.route("/get_cd_data", methods=['POST'])
def get_cd_data():
    parser = reqparse.RequestParser()
    parser.add_argument("state_fp")    
    args = parser.parse_args()
    state_fp = args["state_fp"]
    print(state_fp)
    response = dynamic_map.get_congressional_data(state_fp)
    return json.dumps(response),200


@app.route("/get_zipcode_data", methods=['POST'])
def get_zipcodes():
    parser = reqparse.RequestParser()
    parser.add_argument("state_fp")    
    args = parser.parse_args()
    state_fp = args["state_fp"]
    print(state_fp)
    response = dynamic_map.get_zipcode_data(state_fp)
    return json.dumps(response),200
 
app.run(host='192.168.1.22', debug=True)