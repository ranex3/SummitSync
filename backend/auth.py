from database.db_user import *
import googlemaps

gmapClient = googlemaps.Client(key='AIzaSyAL2ptJW3gxxYbdxhASMLl14Oq16ngxLgs')

# This isnt really needed in the backend
def auth_login(request):
    # Create current user session
    if 'uid' in request:
        uid = request.get('uid')
    else:
        return '400'


    return '200'

# This is not really needed in the backend
def auth_logout(request):
    # Logout of current user session
    if 'uid' in request:
        uid = request.get('uid')
    else:
        return '400'


    return '200'

# This is not really needed in the backend
def auth_register(request):
    try:
        # Take arguments and create a new entry into user db
        # Frontend will handle adding to firebase authentication
        uid = request.get('uid')
        f_name = request.get('f_name')
        l_name = request.get('l_name')
        email_addr = request.get('email_addr')
        account_type = request.get('account_type')
        gender = request.get('gender')
        dob = request.get('dob')
        location = request.get('location')

        # Translate the location to a place_id
        loc_result = gmapClient.geocode(location)

        # ADD IN ERROR CHECKING - REFER TO GMAPS DOCUMENTATION
        place_id = loc_result[0].get('place_id')

        # Add this to the database
        db_user_add(uid, f_name, l_name, email_addr, account_type, gender, dob, place_id)

        return '200'
        
    except KeyError:
        return '400'

def auth_delete(request):
    if 'uid' in request:
        uid = request.get('uid')
    else:
        return '400'

    db_user_delete(uid)

    return '200'


