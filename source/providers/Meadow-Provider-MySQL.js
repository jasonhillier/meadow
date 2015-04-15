/**
* Meadow Provider - MySQL
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow-Schema
*/


var libMySQL = require('mysql2');

var MeadowProvider = function()
{
	function createNew(pFable)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if (typeof(pFable) !== 'object')
		{
			return {new: createNew};
		}
		var _Fable = pFable;

		/**
		 * Build a connection pool, shared within this provider.
		 * This may be more performant as a shared object.
		 */
		var _SQLConnection = libMySQL.createConnection
		(
			{
				connectionLimit: _Fable.settings.MySQL.ConnectionPoolLimit,
				host: _Fable.settings.MySQL.Server,
				port: _Fable.settings.MySQL.Port,
				user: _Fable.settings.MySQL.User,
				password: _Fable.settings.MySQL.Password,
				database: _Fable.settings.MySQL.Database,
				namedPlaceholders: true
			}
		);
		_SQLConnection.config.namedPlaceholders = true;

		var marshalRecordFromSourceToObject = function(pObject, pRecord, pSchema)
		{
			// For now, crudely assign everything in pRecord to pObject
			for(var tmpColumn in pRecord)
			{
				pObject[tmpColumn] = pRecord[tmpColumn];
			}
		};

		var Create = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildCreateQuery();		

			// TODO: Test the query before executing
			if (pQuery.logLevel > 0)
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);

			_SQLConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				function(pError, pRows, pFields)
				{
					tmpResult.error = pError;
					tmpResult.value = pRows.insertId;
					tmpResult.executed = true;
					fCallback();
				}
			);
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var Read = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildReadQuery();

			if (pQuery.logLevel > 0)
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);

			_SQLConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				function(pError, pRows, pFields)
				{
					tmpResult.error = pError;
					tmpResult.value = pRows;
					tmpResult.executed = true;
					fCallback();
				}
			);
		};

		var Update = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildUpdateQuery();		

			if (pQuery.logLevel > 0)
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);

			_SQLConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				function(pError, pRows, pFields)
				{
					tmpResult.error = pError;
					tmpResult.value = pRows;
					tmpResult.executed = true;
					fCallback();
				}
			);
		};

		var Delete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildDeleteQuery();		

			if (pQuery.logLevel > 0)
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);

			_SQLConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				function(pError, pRows, pFields)
				{
					tmpResult.error = pError;
					tmpResult.value = false;
					try
					{
						tmpResult.value = pRows.affectedRows;
					}
					catch(pErrorGettingRowcount)
					{
						_Fable.log.warn('Error getting affected rowcount during delete query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
					}
					tmpResult.executed = true;
					fCallback();
				}
			);
		};

		var Count = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildCountQuery();

			if (pQuery.logLevel > 0)
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);

			_SQLConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				function(pError, pRows, pFields)
				{
					tmpResult.executed = true;
					tmpResult.error = pError;
					tmpResult.value = false;
					try
					{
						tmpResult.value = pRows[0]['RowCount'];
					}
					catch(pErrorGettingRowcount)
					{
						_Fable.log.warn('Error getting rowcount during count query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
					}
					fCallback();
				}
			);
		};

		var tmpNewProvider = (
		{
			marshalRecordFromSourceToObject: marshalRecordFromSourceToObject,

			Create: Create,
			Read: Read,
			Update: Update,
			Delete: Delete,
			Count: Count,

			new: createNew
		});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();