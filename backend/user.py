from flask import jsonify
from database.db_user import *
from firebase_admin import auth
from database.db_conf import *

def user_edit(request):
    # uid must be supplied in param list, all other 
    # params are optional
    
    if 'uid' in request.args:
        uid = request.args.get('uid')
    else:
        return jsonify({"error": "no uid in supplied params"}), '400'
    
    # Extract the UID from the Firebase JWT token in the request
    id_token = request.headers.get('Authorization')
    decoded_token = auth.verify_id_token(id_token.split()[1])
    uid_auth = decoded_token['uid']
        
    # Check if the user is a member of the conference
    if uid != uid_auth and db_user_get(uid_auth).get('type') != 'organiser':
        return jsonify({"error": "authorized user does not have the permission to edit profile"}), 403
        
    if 'f_name' in request.args:
        db_user_first_name_edit(uid, request.args.get('f_name'))
    
    if 'l_name' in request.args:
        db_user_last_name_edit(uid, request.args.get('l_name'))
    
    if 'email_addr' in request.args:
        db_user_email_address_edit(uid, request.args.get('email_addr'))

    if 'address' in request.args:
        db_user_address_edit(uid, request.args.get('address'))
    
    if 'phone_number' in request.args:
        db_user_phone_number_edit(uid, request.args.get('phone_number'))

    if 'dob' in request.args:
        db_user_dob_edit(uid, request.args.get('dob'))

    if 'gender' in request.args:
        db_user_gender_edit(uid, request.args.get('gender'))

    if 'education' in request.args:
        db_user_education_edit(uid, request.args.get('education'))

    if 'research_interest' in request.args:
        db_user_research_interests_edit(uid, request.args.get('research_interest'))
    
    if 'skills' in request.args:
        db_user_skills_edit(uid, request.args.get('skills'))

    if 'availability' in request.args:
        db_user_availability_edit(uid, request.args.get('availability'))

    return '200'

def user_get(request):
    # Delete current entry from user db
    # Frontend will handle deleting from firebase authentication
    if 'uid' in request: 
        uid = request.get('uid')
    else:
        return jsonify({"error": "no uid in supplied params"}), '400'

    if not db_user_get(uid):
        return jsonify({"error": "invalid uid"}), '400'

    return jsonify({"user": db_user_get(uid)}), '200'
