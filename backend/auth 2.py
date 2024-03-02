from database.db_user import *

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

def auth_register(request):
    # Take arguments and create a new entry into user db
    # Frontend will handle adding to firebase authentication
    if 'uid' in request:
        uid = request.get('uid')
    else:
        print("No uid in params")
        return '400'

    if 'f_name' in request:
        f_name = request.get('f_name')
    else:
        print("No f_name in params")
        return '400'

    if 'l_name' in request:
        l_name = request.get('l_name')
    else:
        print("No l_name in params")
        return '400'

    if 'email_addr' in request:
        email_addr = request.get('email_addr')
    else:
        print("No email_addr in params")
        return '400'

    if 'account_type' in request:
        account_type = request.get('account_type')
    else:
        print("No account type in params")
        return '400'

    # Add this to the database
    db_user_add(uid, f_name, l_name, email_addr, account_type)

    return '200'

def auth_delete(request):
    if 'uid' in request:
        uid = request.get('uid')
    else:
        return '400'

    db_user_delete(uid)


