/*
    Kyle Bergman
    INFO 343 with Jacob Morris
    AJAX js
*/

"use strict";
/*
    app.js, main Angular application script
    define your module and controllers here
*/

var url = 'https://api.parse.com/1/classes/';

angular.module('CommentApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
    	$httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'xJP07iOULC2k1DwXUCKSSCbz2t2aGuokrrjXqZMO';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'edf5HoNSZKZhHcrdpsYXXuJJHWKIg6r07d4WnJM5';
    })

    .controller('CommentController', function($scope, $http) {
        $scope.max = 5; //set max rating
        $scope.isReadonly = false; //whether the rating can be altered
        $scope.none = false; //whether there are comments yet

        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.max);
        };

        $scope.ratingStates = [
            {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'}
         ];

         //refreshes comments with correct properties and applies correct animations for
         //loading.
    	$scope.refreshComments = function() {
            $scope.loading = true;
            $http.get(url + 'comments?order=-score')
                .success(function(responseData) {
                    $scope.comments = responseData.results;
                    if(responseData.results.length == 0) {
                        $scope.none = true;
                    }
                })
                .error(function(err) {
                    console.log(err);
                })
                 .finally(function() {
                    $scope.loading = false;
                });
        };

        $scope.refreshComments();

        //Updates a single comment when incrementing score
        $scope.updateComment = function(comment) {
            $http.get(url + 'comments/' + comment.objectId)
                .success(function(responseData) {
                    comment.score = responseData.score;
                })
                .error(function(err) {
                    console.log(err);
                })
        };

        //initialize comment object
        $scope.newComment = {done: false};

        //adds new comment from form
    	$scope.addComment = function(comment) {
            $scope.adding = true; //begin loading animation
            $scope.none = false; //now a comment exists
            comment.score = 0; //default comment score
            $http.post(url + 'comments', comment)
                .success(function(responseData) {
                    comment.objectId = responseData.objectId;
                    $scope.comments.push(comment);
                    //clear form and create new comment object
                    $scope.newComment = {done: false};
                })
                .error(function(err) {
                	console.log(err);
                })
                .finally(function() {
                    $scope.adding = false; //end loading animation
                });
        };

        //increments a comment by one
        var upVoteComment = {
		 	score: {__op: 'Increment', amount: 1}
		}

        //decrements a comment by one if > 0
		function downVoteComment(comment) {
            var downVote = {
    			score: {__op: 'Increment', amount: -1}
    		};
            if(comment.score != 0) {
                return downVote;
            } else {
                downVote = {
                    score: {__op: 'Increment', amount: 0}
                };
                return downVote;
            }
        }

        //upvotes a comment
		$scope.upVote = function(comment) {
			$http.put(url + "comments/" + comment.objectId, upVoteComment)

		 	.success(function(responseData) {
		 		//update was successful!
                $scope.updateComment(comment);
			})
			.error(function(err) {
				//something went wrong!
			});
		}

        //downvotes a comment
        $scope.downVote = function(comment) {
            var downVote = downVoteComment(comment);
            comment.score = Math.max(0, comment.score);
            $http.put(url + "comments/" + comment.objectId, downVote)

            .success(function(responseData) {
                //update was successful!
                $scope.updateComment(comment);
            })
            .error(function(err) {
                //something went wrong!
            });
        }

        //deletes a comment from the comment section
        $scope.deleteComment = function(comment) {
        	$http.delete(url + "comments/" + comment.objectId)
        	.success(function(responseData) {
        		//successful deletion
        		$scope.refreshComments();
        	})
        	.error(function(err) {
        		console.log(err);
        	});
        }

    });