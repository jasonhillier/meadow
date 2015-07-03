/**
* Meadow Raw Query Module
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow-RawQuery
*/
var libAsync = require('async');
var libFS = require('fs');
/**
* Meadow Raw Query Library
*
* This library loads and stores raw queries for FoxHound to use.
* You can overload the default query that is built for each of:
*
* Create
* Read
* Reads
* Update
* Delete
* Count
*
* @class MeadowRawQuery
* @constructor
*/

var MeadowRawQuery = function()
{
	function createNew(pMeadow)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pMeadow) !== 'object') || (!pMeadow.hasOwnProperty('fable')))
		{
			return {new: createNew};
		}
		var _Meadow = pMeadow;

		var _Queries = {};


		/**
		* Load a Query from File
		*
		* @method doLoadQuery
		*/
		function doLoadQuery(pQueryTag, pFileName, fCallBack)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallBack : function() {};

			var _DALQueryRead;
			libFS.readFile(pFileName, 'utf8',
				function (pError, pData)
				{
					if (pError)
					{
						_Meadow.fable.log.error('Problem loading custom query file.', {QueryTag:pQueryTag, FileName:pFileName, Error:pError});
						// There is some debate whether we should leave the queries entry unset or set it to empty so nothing happens.
						doSetQuery(pQueryTag, '');
						tmpCallBack(false);
					}
					else
					{
						_Meadow.fable.log.trace('Loaded custom query file.', {QueryTag:pQueryTag, FileName:pFileName});
						doSetQuery(pQueryTag, pData);
						tmpCallBack(true);
					}
				});
			return _Meadow;
		}


		/**
		* Set a Custom Query from a String
		*
		* @method doSetQuery
		*/
		function doSetQuery(pQueryTag, pQueryString)
		{
			_Queries[pQueryTag] = pQueryString;
			return _Meadow;
		}


		/**
		* Return a Custom Query
		*
		* @method doGetQuery
		*/
		function doGetQuery(pQueryTag)
		{
			// This allows us to add hooks at the higher layer (from routing)
			if (_Queries.hasOwnProperty(pQueryTag))
				return _Queries[pQueryTag];

			// Return false if there is no query for that tag.
			return false;
		}


		/**
		* Check if a Custom Query exists
		*
		* @method doCheckQuery
		*/
		function doCheckQuery(pQueryTag)
		{
			return _Queries.hasOwnProperty(pQueryTag);
		}

		var tmpNewMeadowRawQuery = (
		{
			loadQuery: doLoadQuery,
			setQuery: doSetQuery,

			checkQuery: doCheckQuery,
			getQuery: doGetQuery,

			new: createNew
		});

		return tmpNewMeadowRawQuery;
	}

	return createNew();
};

module.exports = new MeadowRawQuery();