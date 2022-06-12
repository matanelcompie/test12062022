<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SectorialFilterDefinitionGroups;
use App\Models\SectorialFilterDefinitions;
use App\Models\SectorialFilterDefinitionsValues;
use App\Models\SectorialFilterItems;
use App\Models\SectorialFilterItemValues;
use App\Models\SectorialFilterTemplates;
use App\Models\SectorialFilters;
use App\Models\User;
use Auth;
use App\Libraries\Helper;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

class SectorialFiltersController extends Controller {

	/*
		Function that deletes specific sectorialFilter
	*/
    public function deleteExistingSectorialFilter($userKey , $roleByUserID , $filterID){
		$user = User::select(['id'])->where('key' , $userKey)->first();
		$userID = -1 ; 
		if($user){
			$userID = $user->id;
		}
		
		$sectorialFilter = SectorialFilters::select(['id' , 'name' , 'role_by_user_id' , 'user_id' ])->where('id' , $filterID )->first();
		if($sectorialFilter){
 
			
			if($sectorialFilter->user_id == $userID && $sectorialFilter->role_by_user_id == $roleByUserID){
				$sectorialFilterItem = SectorialFilterItems::where('entity_id' , $sectorialFilter->id)->get();
				for($s = 0;$s <sizeof($sectorialFilterItem) ; $s++){
					 
					$sectorialFilterDefinition = SectorialFilterDefinitions::select(['type' , 'multiselect'])->where('id' ,$sectorialFilterItem[$s]->sectorial_filter_definition_id)->first();
				    if($sectorialFilterDefinition){
						if($sectorialFilterDefinition->multiselect == 1 && ($sectorialFilterDefinition->type == 1 || $sectorialFilterDefinition->type == 2)){
							$sectorialFilterItemValues = SectorialFilterItemValues::where('sectorial_filter_item_id' , $sectorialFilterItem[$s]->id )->get();
							for($i = 0;$i <sizeof($sectorialFilterItemValues) ; $i++){
								$sectorialFilterItemValues[$i]->forceDelete();
							}
						}
					    $sectorialFilterItem[$s]->forceDelete();
						$sectorialFilter->forceDelete();
						
					}
				}
				
				$foundFilterItems = SectorialFilterItems::where('entity_id',$sectorialFilter->id)->get();
			    if($foundFilterItems){
				  if(sizeof($foundFilterItems) == 0){
					$sectorialFilter = SectorialFilters::where('id' , $sectorialFilter->id)->first();
				    if($sectorialFilter){
						$sectorialFilter->forceDelete();
					}
				  }
			    }
				
				$jsonOutput = app()->make( "JsonOutput" );
						$data = SectorialFilters::where('user_id',$userID)->where('role_by_user_id',$roleByUserID)->get();
		                for($m = 0 ; $m < sizeof($data) ; $m++){
					    $tempArray = array();
						$tempFilterItem = SectorialFilterItems::select(['entity_type' , 'sectorial_filter_definition_id'])->where('entity_id' , $data[$m]->id )->get();
                        for($a = 0 ; $a < sizeof($tempFilterItem) ; $a++){
							if($tempFilterItem[$a]->entity_type == 0){
								$data[$m]->inherited = 0;
								$tempDefinition = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id'])->where('id' , $tempFilterItem[$a]->sectorial_filter_definition_id)->get();
								
								
								for($s = 0 ; $s <sizeof( $tempDefinition);$s++){
									//$user->roles_by_user[$i]->sectorial_filters[$m]->definition_id = $tempDefinition->id;
                                   if(!in_array($tempDefinition[$s]->sectorial_filter_definitions_group_id ,$tempArray )){                                
								     array_push($tempArray , $tempDefinition[$s]->sectorial_filter_definitions_group_id);
								   }
								}
							}
							else{
								$data[$m]->inherited = 1;
							}
							$tempDefinition = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id'])->where('id' , $tempFilterItem[$a]->sectorial_filter_definition_id)->first();
							if($tempDefinition){
									$data[$m]->definition_id = $tempDefinition->id;
                                    $data[$m]->definition_group_id = $tempDefinition->sectorial_filter_definitions_group_id;									
							}
						}
						$data[$m]->definition_group_ids = $tempArray;	
						 
		               }
						$jsonOutput->setData($data);
				
			}
		}
	}

	/*
		Function that adds new SectorialFilter by POST params
	*/
    public function addNewSectorialFilter(Request $request , $userKey , $roleByUserID){
		$user = User::select(['id'])->where('key' , $userKey)->first();
		$userID = -1 ; 
		if($user){
			$userID = $user->id;
		}
		$jsonOutput = app()->make( "JsonOutput" );
		$sectorial_filters = $request->input('sectorial_filters');
		$filtersArr = explode(';' , $sectorial_filters);
		
			$sectorialFilter = new SectorialFilters;
			
			$sectorialFilter->name = $request->input('filter_name_header');
			$sectorialFilter->role_by_user_id = $roleByUserID;
			$sectorialFilter->user_id = $userID;
			$sectorialFilter->key = Helper::getNewTableKey('sectorial_filters', 10);
			$sectorialFilter->save();
		for($i = 0; $i < sizeof($filtersArr) ; $i++){
			$filterItems = explode('|' , $filtersArr[$i]);
			$sectorialFilterItem = new SectorialFilterItems;
			$sectorialFilterItem->entity_type = 0 ;
			$sectorialFilterItem->entity_id = $sectorialFilter->id ;
			$sectorialFilterItem->sectorial_filter_definition_id = $filterItems[0] ;
			$sectorialFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
			$sectorialFilterItem->save();
			
			if($filterItems[2] == 1 || $filterItems[2] == 2){
				if($filterItems[3] == 0) //not multiselect
				{
					$sectorialFilterItem->numeric_value = $filterItems[4];
				}
				elseif($filterItems[3] == 1){//multiselect
					$itemValuesArr = explode(',' , $filterItems[4]);
					for($m = 0; $m < sizeof($itemValuesArr) ; $m++){
						$newSectorialItemValus = new SectorialFilterItemValues;
						$newSectorialItemValus->sectorial_filter_item_id = $sectorialFilterItem->id;
						$newSectorialItemValus->value = $itemValuesArr[$m];
						$newSectorialItemValus->key = Helper::getNewTableKey('sectorial_filter_item_values', 5);
						$newSectorialItemValus->save();
					}
				}
			}
			elseif($filterItems[2] == 0 || $filterItems[2] == 3 || $filterItems[2] == 4){
				$sectorialFilterItem->numeric_value = $filterItems[4];
			}
			elseif($filterItems[2] == 5){
				$sectorialFilterItem->string_value = $filterItems[4];
			}
			$sectorialFilterItem->save();
			
		}
		$data = SectorialFilters::where('user_id',$userID)->where('role_by_user_id',$roleByUserID)->get();
		for($m = 0 ; $m < sizeof($data) ; $m++){
						$tempFilterItem = SectorialFilterItems::select(['entity_type' , 'sectorial_filter_definition_id'])->where('entity_id' , $data[$m]->id )->first();
                        $tempArray = array();
						$tempFilterItem = SectorialFilterItems::select(['entity_type' , 'sectorial_filter_definition_id'])->where('entity_id' , $data[$m]->id )->get();
                        for($a = 0 ; $a < sizeof($tempFilterItem) ; $a++){
							if($tempFilterItem[$a]->entity_type == 0){
								$data[$m]->inherited = 0;
								$tempDefinition = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id'])->where('id' , $tempFilterItem[$a]->sectorial_filter_definition_id)->get();
								
								
								for($s = 0 ; $s <sizeof( $tempDefinition);$s++){
									//$user->roles_by_user[$i]->sectorial_filters[$m]->definition_id = $tempDefinition->id;
                                   if(!in_array($tempDefinition[$s]->sectorial_filter_definitions_group_id ,$tempArray )){                                
								     array_push($tempArray , $tempDefinition[$s]->sectorial_filter_definitions_group_id);
								   }
								}
							}
							else{
								$data[$m]->inherited = 1;
							}
							$tempDefinition = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id'])->where('id' , $tempFilterItem[$a]->sectorial_filter_definition_id)->first();
							if($tempDefinition){
									$data[$m]->definition_id = $tempDefinition->id;
                                    $data[$m]->definition_group_id = $tempDefinition->sectorial_filter_definitions_group_id;									
							}
						}
						$data[$m]->definition_group_ids = $tempArray;	
						
		}
		
		
		$jsonOutput->setData($data);
	}

	/*
		Function that performs bulk Edit/Delete to sectorial filters list
	*/
	public function addEditDeleteSectorialFilter(Request $request,$userKey , $roleByUserID ){
		$jsonOutput = app()->make( "JsonOutput" );
		$user = User::select(['id'])->where('key' , $userKey)->first();
		$userID = -1 ; 
		if($user){
			$userID = $user->id;
		}
		if($request->input('add_filter_string') != null && trim($request->input('add_filter_string')) != ''){
		   $tempArray = explode(';' , $request->input('add_filter_string'));
		   for($i = 0 ; $i<sizeof($tempArray) ; $i++){
			  $tempArrayElements = explode('|' , $tempArray[$i]);


              $newFilterFilterItem = new SectorialFilterItems;
			  $newFilterFilterItem->entity_type = 0;
              $newFilterFilterItem->entity_id = $tempArrayElements[4];
              $newFilterFilterItem->sectorial_filter_definition_id = $tempArrayElements[0] ;			  
			  
			  if($tempArrayElements[2] <= 4){
                 $newFilterFilterItem->numeric_value =  $tempArrayElements[3] ;
			  }
			  elseif($tempArrayElements[2] ==5){
				 $newFilterFilterItem->string_value =  $tempArrayElements[3] ; 
			  }
			  
			  $newFilterFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);			  
              $newFilterFilterItem->save();
		   }
		}
		if($request->input('edit_filter_string') != null && trim($request->input('edit_filter_string')) != ''){
		   $tempArray = explode(';' , $request->input('edit_filter_string'));
		   for($i = 0 ; $i<sizeof($tempArray) ; $i++){
			  $tempArrayElements = explode('|' , $tempArray[$i]);
              $newSectorialFilter = SectorialFilters::where('role_by_user_id' ,$roleByUserID )
			  ->where('user_id' , $userID)
			  ->where('id' , $tempArrayElements[4])
			  ->first();
			  if($newSectorialFilter){
				  
              $newFilterFilterItem = SectorialFilterItems::where('entity_type' , 0)
           	  ->where('entity_id' , $newSectorialFilter->id)
              ->where('sectorial_filter_definition_id' , $tempArrayElements[0])			  
			  ->first();
              if($newFilterFilterItem){
			  if($tempArrayElements[2] <= 4){
                 $newFilterFilterItem->numeric_value =  $tempArrayElements[3] ;
			  }
			  elseif($tempArrayElements[2] ==5){
				 $newFilterFilterItem->string_value =  $tempArrayElements[3] ; 
			  }
			  
			   			  
              $newFilterFilterItem->save();
			  }
			  }
		   }
		}
		
		if($request->input('delete_filter_string') != null && trim($request->input('delete_filter_string')) != ''){
			$deleteArr = explode(',' , $request->input('delete_filter_string'));
			$sectorialFilterID = null;
			for($i = 0 ; $i < sizeof($deleteArr) ; $i++){
				$sectorialFilterDefinition = SectorialFilterDefinitions::where('id' , $deleteArr[$i])->first();
				if($sectorialFilterDefinition){
					$sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id' , $sectorialFilterDefinition->id)->first();
					if($sectorialFilterItem){
						if($sectorialFilterID == null){
							$sectorialFilterID = $sectorialFilterItem->entity_id;
						}
						if($sectorialFilterItem->entity_type == 0){
							$sectorialFilter = SectorialFilters::where('id' , $sectorialFilterItem->entity_id)->first();
						    if($sectorialFilter ){
							  if($sectorialFilter->role_by_user_id == $roleByUserID){
								$sectorialFilterItemValues = SectorialFilterItemValues::where('sectorial_filter_item_id' , $sectorialFilterItem->id )->get();
							      for($c = 0;$c <sizeof($sectorialFilterItemValues) ; $c++){
								    $sectorialFilterItemValues[$c]->forceDelete();
							      }
								$sectorialFilterItem->forceDelete();
							  }
							}
						}
					}
				}
			}
			
			$foundFilterItems = SectorialFilterItems::where('entity_id',$sectorialFilterID)->get();
			if($foundFilterItems){
				if(sizeof($foundFilterItems) == 0){
					$sectorialFilter = SectorialFilters::where('id' , $sectorialFilterID)->first();
				    if($sectorialFilter){
						$sectorialFilter->forceDelete();
					}
				}
			}
			
		}
	    if($request->input('delete_string_multi_items') != null && trim($request->input('delete_string_multi_items')) != ''){
			$deleteArr = explode(',' , $request->input('delete_string_multi_items'));
			$sectorialFilterID = null;
			for($i = 0 ; $i < sizeof($deleteArr) ; $i++){
				$sectorialFilterDefinition = SectorialFilterDefinitions::where('id' , $deleteArr[$i])->first();
				if($sectorialFilterDefinition){
					$sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id' , $sectorialFilterDefinition->id)->first();
					if($sectorialFilterItem){
						if($sectorialFilterID == null){
							$sectorialFilterID = $sectorialFilterItem->entity_id;
						}
						if($sectorialFilterItem->entity_type == 0){
							$sectorialFilter = SectorialFilters::where('id' , $sectorialFilterItem->entity_id)->first();
						    if($sectorialFilter ){
							  if($sectorialFilter->role_by_user_id == $roleByUserID){
								$sectorialFilterItemValues = SectorialFilterItemValues::where('sectorial_filter_item_id' , $sectorialFilterItem->id )->get();
							      for($c = 0;$c <sizeof($sectorialFilterItemValues) ; $c++){
								    $sectorialFilterItemValues[$c]->forceDelete();
							      }
								$sectorialFilterItem->forceDelete();
							  }
							}
						}
					}
				}
			}
			
			$foundFilterItems = SectorialFilterItems::where('entity_id',$sectorialFilterID)->get();
			if($foundFilterItems){
				if(sizeof($foundFilterItems) == 0){
					$sectorialFilter = SectorialFilters::where('id' , $sectorialFilterID)->first();
				    if($sectorialFilter){
						$sectorialFilter->forceDelete();
					}
				}
			}
			
		}
	   
	    if($request->input('add_edit_string_multi_items') != null && trim($request->input('delete_string_multi_items')) != ''){
			$editArr = explode(';' , $request->input('add_edit_string_multi_items'));
			for($i = 0 ; $i < sizeof($editArr) ; $i++){
				$arrParts = explode('|' , $editArr[$i]);
				$itemsArr = explode(',' , $arrParts[1]);
				$sectorialFilterDefinition = SectorialFilterDefinitions::where('id' , $arrParts[0])->first();
				if($sectorialFilterDefinition){
					$sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id' , $sectorialFilterDefinition->id)->first();
					if(!$sectorialFilterItem){
						$sectorialFilterItem = new SectorialFilterItems;
						$sectorialFilterItem->entity_type = 0;
						$sectorialFilterItem->sectorial_filter_definition_id =$arrParts[0];
						$sectorialFilterItem->entity_id = $request->input('sectorial_filter_id');
						$sectorialFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
					    $sectorialFilterItem->save();
					}
						if($sectorialFilterItem->entity_type == 0){
							$sectorialFilterItemValues = SectorialFilterItemValues::where('sectorial_filter_item_id' ,$sectorialFilterItem->id )->get();
							for($j =0 ; $j<sizeof($sectorialFilterItemValues) ; $j++){
								$sectorialFilterItemValues[$j]->forceDelete();
							}
							for($j =0 ; $j<sizeof($itemsArr) ; $j++){
								$newItem = new SectorialFilterItemValues;
								$newItem->sectorial_filter_item_id = $sectorialFilterItem->id;
								$newItem->value = $itemsArr[$j];
						        $newItem->key = Helper::getNewTableKey('sectorial_filter_item_values', 5);
								$newItem->save();
							}
						}
					
				}
			}
			
			 
			
		}
	   
	   
		
		$sectorialFilter = SectorialFilters::where('id' ,$request->input('sectorial_filter_id') )->first();
		if($sectorialFilter){
			$sectorialFilter->name = $request->input('filter_name_header') ;
			$sectorialFilter->save();
		}
		$data = SectorialFilters::where('user_id',$userID)->where('role_by_user_id',$roleByUserID)->get();
		for($m = 0 ; $m < sizeof($data) ; $m++){
						$tempFilterItem = SectorialFilterItems::select(['entity_type' , 'sectorial_filter_definition_id'])->where('entity_id' , $data[$m]->id )->first();
                       $tempArray = array();
						$tempFilterItem = SectorialFilterItems::select(['entity_type' , 'sectorial_filter_definition_id'])->where('entity_id' , $data[$m]->id )->get();
                        for($a = 0 ; $a < sizeof($tempFilterItem) ; $a++){
							if($tempFilterItem[$a]->entity_type == 0){
								$data[$m]->inherited = 0;
								$tempDefinition = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id'])->where('id' , $tempFilterItem[$a]->sectorial_filter_definition_id)->get();
								
								
								for($s = 0 ; $s <sizeof( $tempDefinition);$s++){
									//$user->roles_by_user[$i]->sectorial_filters[$m]->definition_id = $tempDefinition->id;
                                   if(!in_array($tempDefinition[$s]->sectorial_filter_definitions_group_id ,$tempArray )){                                
								     array_push($tempArray , $tempDefinition[$s]->sectorial_filter_definitions_group_id);
								   }
								}
							}
							else{
								$data[$m]->inherited = 1;
							}
							$tempDefinition = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id'])->where('id' , $tempFilterItem[$a]->sectorial_filter_definition_id)->first();
							if($tempDefinition){
									$data[$m]->definition_id = $tempDefinition->id;
                                    $data[$m]->definition_group_id = $tempDefinition->sectorial_filter_definitions_group_id;									
							}
						}
						$data[$m]->definition_group_ids = $tempArray;	
		}
		
	
		
		 $jsonOutput->setData($data);
	}
	
	/*
		Function that returns all sectorial filter definitions groups
	*/
    public function getSectorialFilterDefenitionGroups(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$groups = SectorialFilterDefinitionGroups::select(['id' , 'name'])->get();
		for($i=0;$i<sizeof($groups);$i++){
			$groups[$i]->is_opened = 0;
			$groups[$i]->definitions = SectorialFilterDefinitions::select(['id' , 'name' , 'type' , 'multiselect' , 'model' , 'model_list_function' , 'model_list_dependency_id'])->where('sectorial_filter_definitions_group_id' , $groups[$i]->id)->get() ;
		  
			for($j=0;$j<sizeof($groups[$i]->definitions);$j++){
				  
				  $numericValue =  '' ;
				  $stringValue = '';
				  $arrayValues = array();
				  $sectorialFilterID = -1;
				  
				  if($request->input('user_role_id') != null){
				  $sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id' , $groups[$i]->definitions[$j]->id)
				  ->where('entity_type' , 0)
  				  ->first();
				  if($sectorialFilterItem){
					  $sectorialFilterValue = SectorialFilters::where('id' , $sectorialFilterItem->entity_id )
					  ->where('role_by_user_id' , $request->input('user_role_id') )
					  ->first();
					  if($sectorialFilterValue){
						  if($groups[$i]->definitions[$j]->type == 0){
					         $numericValue = $sectorialFilterItem->numeric_value == 1 ? 'כן' : ($sectorialFilterItem->numeric_value == 0 ? 'לא' : '') ;
						  }
						  elseif($groups[$i]->definitions[$j]->type == 1 || $groups[$i]->definitions[$j]->type == 2){
					        if($groups[$i]->definitions[$j]->multiselect == 1){
								$numericValue = '';
							}
							else{
								
								$sectorialFilterDefValByKey = SectorialFilterDefinitionsValues::select(['value'])->where('id' , $sectorialFilterItem->numeric_value)
								->where('sectorial_filter_definition_id' , $groups[$i]->definitions[$j]->id )->first();
							   if($sectorialFilterDefValByKey){
								   
							       $numericValue = $sectorialFilterDefValByKey->value ;
							   }
							}
					      }
						  elseif($groups[$i]->definitions[$j]->type == 3 || $groups[$i]->definitions[$j]->type == 4){
					        $numericValue = $sectorialFilterItem->numeric_value ;
					      }
					      elseif($groups[$i]->definitions[$j]->type == 5){
					        $stringValue = $sectorialFilterItem->string_value ;
					      }
					  }
					  $sectorialFilterID =  $sectorialFilterItem->id;
				  }
				  }
				  
  				  if($groups[$i]->definitions[$j]->type == 0 || $groups[$i]->definitions[$j]->type == 3 || $groups[$i]->definitions[$j]->type == 4){
					 $groups[$i]->definitions[$j]->def_value = $numericValue;
				  }
				  elseif($groups[$i]->definitions[$j]->type == 1){
					 if($groups[$i]->definitions[$j]->multiselect == 1){
                         if($sectorialFilterID > 0){
							  $groups[$i]->definitions[$j]->def_values = SectorialFilterItemValues::select(['id' , 'value as name'])->where('sectorial_filter_item_id' , $sectorialFilterID)->get();
						 }
						 else{
							 $groups[$i]->definitions[$j]->def_values = $arrayValues;
						 }
					 }
					 else{
						
						 $groups[$i]->definitions[$j]->def_value = trim($numericValue);
					 }
					 $groups[$i]->definitions[$j]->values = SectorialFilterDefinitionsValues::select(['id' , 'value'])->where('sectorial_filter_definition_id' , $groups[$i]->definitions[$j]->id)->get();
				  }
				  elseif($groups[$i]->definitions[$j]->type == 2){
					  if($groups[$i]->definitions[$j]->model != NULL && trim($groups[$i]->definitions[$j]->model) != ''   ){
					  $model = new $groups[$i]->definitions[$j]->model;
                      $method = $groups[$i]->definitions[$j]->model_list_function;
					  if($groups[$i]->definitions[$j]->model_list_dependency_id  == NULL){
                      $list = $model->{$method}();
					  }
					  else{
							 $list =  array();   
					  }
					  $groups[$i]->definitions[$j]->values = $list;
					  }
					  else{
						 $groups[$i]->definitions[$j]->values=array(); 
					  }
					  
					  if($groups[$i]->definitions[$j]->multiselect == 1){
                         if($sectorialFilterID > 0){
							  $groups[$i]->definitions[$j]->def_values = SectorialFilterItemValues::select(['id' , 'value as name'])->where('sectorial_filter_item_id' , $sectorialFilterID)->get();
						 }
						 else{
							 $groups[$i]->definitions[$j]->def_values = $arrayValues;
						 }
					 }
					 else{
						 $groups[$i]->definitions[$j]->def_value = $numericValue;
					 }
					   
				  }
				  elseif($groups[$i]->definitions[$j]->type == 5){
					  $groups[$i]->definitions[$j]->def_value = $stringValue;
				  }
			}
		}
		$jsonOutput->setData($groups);
	}

	/*
		Function that returns all sectorial filter definitions groups by values (POST params)
	*/
	public function getSectorialFilterDefenitionGroupValues(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		 if($request->input("user_role_id") != null){
			 $sectorialFilters = SectorialFilters::select(['id' , 'name'])
			 ->where('role_by_user_id' , $request->input("user_role_id"))
			 ->get();
			 
			 for($i = 0 ; $i < sizeof($sectorialFilters) ; $i++){
				$sectorialFilterItems = SectorialFilterItems::select(['sectorial_filter_items.id as id' , 'type' , 'numeric_value'
				, 'string_value' , 'multiselect' , 
				'sectorial_filter_definition_id as definition_id' , 'model' , 'model_list_function'
				, 'model_list_dependency_id'
				])
				->withSectorialFilterDefs()->where('entity_type' , 0)
				->where('entity_id' , $sectorialFilters[$i]->id)
				->get();
				$extraArray = array();
			   for($j = 0 ; $j < sizeof($sectorialFilterItems) ; $j++){
				if($sectorialFilterItems[$j]->type ==0){
                   if($sectorialFilterItems[$j]->numeric_value == 1){
					   $sectorialFilterItems[$j]->value = 'כן';
				   }
				   elseif($sectorialFilterItems[$j]->numeric_value == 0){
					   $sectorialFilterItems[$j]->value = 'לא';
				   }
	
				}
                elseif($sectorialFilterItems[$j]->type ==1 || $sectorialFilterItems[$j]->type ==3 || $sectorialFilterItems[$j]->type ==4){	
				    if($sectorialFilterItems[$j]->type ==1){
						if($sectorialFilterItems[$j]->multiselect == 1){
							$sectorialFilterItems[$j]->value = '';
							$sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id' , $sectorialFilterItems[$j]->definition_id)
							->where('entity_type' , 0)
							->first();
							if($sectorialFilterItem){
							   $sectorialFilterItems[$j]->values = SectorialFilterItemValues::where('sectorial_filter_item_id' , $sectorialFilterItem->id)->get();
							}
						}
						else{
							$defValue = SectorialFilterDefinitionsValues::select(['value'])
							->where('id' , $sectorialFilterItems[$j]->numeric_value)
							->where('sectorial_filter_definition_id' ,$sectorialFilterItems[$j]->definition_id )
							->first();
							if($defValue){
								$sectorialFilterItems[$j]->value = $defValue->value;
							}
						}
					}
					else{
						$sectorialFilterItems[$j]->value = $sectorialFilterItems[$j]->numeric_value;
					}
				}
                elseif($sectorialFilterItems[$j]->type ==2){
					if($sectorialFilterItems[$j]->multiselect == 1){
						$sectorialFilterItems[$j]->values = SectorialFilterItemValues::select(['id' , 'value as name' , 'key'])->where('sectorial_filter_item_id' ,$sectorialFilterItems[$j]->id )->get();
					}
					else{
					  $model = new $sectorialFilterItems[$j]->model;
                      $method = $sectorialFilterItems[$j]->model_list_function;
					  if($sectorialFilterItems[$j]->model_list_dependency_id == NULL){
                      $list = $model->{$method}();
					  $param =$sectorialFilterItems[$j]->numeric_value ;
					  $dependedList = SectorialFilterDefinitions::select(['id as definition_id' , 'type' , 'name' , 'model' , 'multiselect' , 'model_list_function' , 'model_list_dependency_id'])->where('model_list_dependency_id' , $sectorialFilterItems[$j]->definition_id)->get();
					  for($u = 0;$u < sizeof($dependedList);$u++){
						  if($dependedList[$u]->model != ''){
						 $innerModel = new $dependedList[$u]->model;
                         $innerMethod = $dependedList[$u]->model_list_function;
						 
						 $dependedList[$u]->def_values = $innerModel->{$innerMethod}($param);
						  
						  array_push( $extraArray ,  $dependedList[$u]);
						  }
						  }						  
		
					   
					 // $sectorialFilterItems[$j]->dependedList = $dependedList;
					  }
					  else{
						  $model = new $sectorialFilterItems[$j]->model;
                          $method = $sectorialFilterItems[$j]->model_list_function;
						  $param = '';
						  if($sectorialFilterItems[$j]->numeric_value != NULL){
							 $param = $sectorialFilterItems[$j]->numeric_value; 
						  }
						  $list = $model->{$method}($param);
						 
						  
					  }
					  $sectorialFilterItems[$j]->def_values =  array_merge(get_object_vars($list) , $extraArray);
                      
					  $tempTable1 = SectorialFilterItems::select(['entity_id' , 'numeric_value'])->where('sectorial_filter_definition_id',$sectorialFilterItems[$j]->definition_id)->first();
					  if($tempTable1 ){
						  $tempTable2 = SectorialFilters::where('id' , $tempTable1->entity_id)->where('role_by_user_id' , $request->input("user_role_id"))->first();
						  if($tempTable2){
							   $numericValue = $tempTable1->numeric_value;
					          $sectorialFilterItems[$j]->value=$numericValue;	
						  }
						  else{
							  $sectorialFilterItems[$j]->value="";
						  }
					  }
                      else{
						  $sectorialFilterItems[$j]->value = "";
					  }						  
					  
					//  $ttt = array_merge($sectorialFilterItems[$j]->def_values , $extraArray);
					  
					  for($n = 0;$n<sizeof($list);$n++){
						  if($list[$n]->id == $sectorialFilterItems[$j]->numeric_value){
							  $sectorialFilterItems[$j]->value = $list[$n]->name;
							  break;
						  }
					  }
					  
					  
					}
				}
                elseif($sectorialFilterItems[$j]->type ==5){
                     	$sectorialFilterItems[$j]->value = $sectorialFilterItems[$j]->string_value;				
				}				
			 }
			  
			  $sectorialFilters[$i]->values_list = $sectorialFilterItems;
		// $sectorialFilters[$i]->values_list = array_merge(get_object_vars($sectorialFilterItems) , $extraArray);
			 }
		 }
		$jsonOutput->setData($sectorialFilters);
	}

	/*
		Function that returns sub lists dependencies IDS
	*/
	public function getSubListByDependencyID(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$filterDefs = SectorialFilterDefinitions::select(['id' , 'sectorial_filter_definitions_group_id' , 'name' , 'type' , 'multiselect'  , 'model' , 'model_list_function' ])->where('model_list_dependency_id' , $request->input('dep_id') )->get();
		for($i = 0 ; $i < sizeof($filterDefs); $i++){
				if($filterDefs[$i]->model != NULL && trim($filterDefs[$i]->model) != '' && $filterDefs[$i]->model_list_function != NULL && trim($filterDefs[$i]->model_list_function) != ''){
					if($request->input('sub_list_key') != NULL && trim($request->input('sub_list_key')) != ''){
						$model = new $filterDefs[$i]->model;
                        $method = $filterDefs[$i]->model_list_function;
                        $list = $model->{$method}($request->input('sub_list_key'));
						$filterDefs[$i]->values_list = $list;
						
					}
				}
		}
		$jsonOutput->setData($filterDefs);
	}
}