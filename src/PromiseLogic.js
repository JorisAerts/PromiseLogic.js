/**

	Deferred AND, OR and NOT expressions
	Evaluators are evalutated based on the return value of the promise,
	which van either be rejected (false) or resolved(true)

*/
(function(global, jQuery){

	var
	Deferred = jQuery.Deferred,
	isFunction = jQuery.isFunction,
	each = jQuery.each,

	isPromise = function(obj){
		return typeof(obj) == 'object' && isFunction(obj.done) && isFunction(obj.fail)
	},

	getResultDeferred = function(condition){
		var result;
		if(isPromise(condition)){
			result = condition;
		}else{
			if(isFunction(condition)){
				condition = condition();
			}
			result = new Deferred();
			if(!!condition){
				result.resolve(condition);
			}else{
				result.reject(condition);
			}
		}
		return result;
	},

	EvaluatorResult = function(){
		var args = arguments;
		this.results = args[0];
		this.success = args[1];
		this.failed  = args[2];
	},

	Checks = {
		A: function(result){
			return result.failed.length;
		},
		O: function(result){
			return !result.success.length;
		},
		N: function(result){
			return result.success.length;
		}
	},

	Evaluator = function(conditions, all, expressionCheck){
		var
			count   = conditions.length,
			result  = new Deferred(),
			results = [],
			success = [],
			failed  = [],
			expressionResult = new EvaluatorResult(results, success, failed),
			check 	= function(i){
				var expressionCheckResult = expressionCheck(expressionResult);
				if(!--count || !all && expressionCheckResult){
					expressionCheckResult ? result.reject(expressionResult) : result.resolve(expressionResult);
				}
				else next(++i);
			},
			next = function(i){
				if(conditions.length==i) return;
				var condition = conditions[i];
				getResultDeferred(condition).then(
					function(){
						results[i] = arguments;
						success.push(i);
						check(i);
					},
					function(){
						results[i] = arguments;
						failed.push(i);
						check(i);
					}
				);
			};
		next(0);
		return result;
	}
	;

	global.PromiseLogic = {

		AND: function(){
				return Evaluator(arguments, 0, Checks.A)
		},

		OR: function(){
				return Evaluator(arguments, 0, Checks.O)
		},

		NOT: function(){
				return Evaluator(arguments, 0, Checks.N)
		},

		ALL: {

				AND: function(){
						return Evaluator(arguments, 1, Checks.A)
				},

				OR: function(){
						return Evaluator(arguments, 1, Checks.O)
				},

				NOT: function(){
						return Evaluator(arguments, 1, Checks.N)
				}

		}

	};

})(this, jQuery);
