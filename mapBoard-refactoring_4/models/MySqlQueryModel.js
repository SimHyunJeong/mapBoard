exports.selectQuery = function(sqlConnection, columns, tableName, conditionQuery, values, action, callback)
{
    var columnQuery = makeColumnQuery(columns);
    var sqlQuery;

    if(conditionQuery == null){
        sqlQuery = 'select ' + columnQuery + 
                    ' from ' + tableName;
    }
    else{
        sqlQuery = 'select ' + columnQuery + 
                    ' from ' + tableName + 
                    ' where ' + conditionQuery;
    }
    
    var resultData = sqlConnection.query(sqlQuery, values, (err, rows) => {
        action(err, rows, callback);
    });

    console.log(resultData.sql);
}

exports.insertQuery = function(sqlConnection, tableName, columns, values, action, callback)
{
    var columnQuery = '( ' + makeColumnQuery(columns) + ' )';
    var sqlQuery = 'insert into ' + tableName + columnQuery +
                ' values ?';
                    
    var resultData = sqlConnection.query(sqlQuery, [values], (err, result) => {
        action(err, result, values, callback);
    });

    console.log(resultData.sql);
}

exports.deleteQuery = function(sqlConnection, tableName, conditionQuery, values, action, callback)
{
    var sqlQuery = 'delete from ' + tableName +
                ' where ' + conditionQuery;
                    
    var resultData = sqlConnection.query(sqlQuery, values, (err, result) => {
        action(err, result, callback);
    });

    console.log(resultData.sql);
}

exports.updateQuery = function(sqlConnection, tableName, columns, conditionQuery, values, action, callback)
{
    var columnQuery = makeUpdateColumnQuery(columns);
    var sqlQuery = 'update ' + tableName +
                ' set ' + columnQuery + 
                ' where ' + conditionQuery;
                
    var resultData = sqlConnection.query(sqlQuery, values, (err, result) => {
        action(err, result, callback);
    });

    console.log(resultData.sql);
}





function makeUpdateColumnQuery(arr){
    var result = '';
    for(var i = 0; i < arr.length; i++){
        if(i == arr.length-1){
            result += arr[i] + ' = ?';            
        }
        else{
            result += arr[i] + ' = ? ,';
        }
    }
    return result;
}

function makeColumnQuery(arr){
    var result = '';
    for(var i = 0; i < arr.length; i++){
        if(i == arr.length-1){
            result += arr[i];            
        }
        else{
            result += arr[i] + ', ';
        }
    }
    return result;
}