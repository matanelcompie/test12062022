<?php

namespace App\DTO;

use App\Enums\CommonEnum;
use App\Libraries\Helper;
use App\Models\City;
use App\Models\CsvDocument;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Exception;
use Illuminate\Http\Request;

class PaginationDto
{
  public  function __construct($pagination)
  {
    $this->orderBy = isset($pagination['orderBy']) && $pagination['orderBy'] != '' ? $pagination['orderBy'] : null;
    $this->orderByDesc = isset($pagination['orderByDesc']) ? $pagination['orderByDesc'] : null;
    $this->sortBy = isset($pagination['filterBy']) && $pagination['filterBy'] != '' ? $pagination['filterBy'] : null;
    $this->sortByValue = isset($pagination['filterByValue']) ? $pagination['filterByValue'] : null;
    $this->offsetIndex = isset($pagination['offsetIndex']) ? $pagination['offsetIndex'] : 0;
    $this->searchText = isset($pagination['searchText']) ? $pagination['searchText'] : null;
  }

  /**
   * Name field for order by query
   * @var string
   */
  public  $orderBy;

  /**
   * 
   * @var int | CommonEnum
   */
  public  $orderByDec;

  /**
   * Name field for filter by query
   * @var string
   */
  public $filterBy;

  /**
   * value field for filter by query
   * @var string
   */
  public $filterByValue;

  /**
   * THe offset index for start query from 
   *
   * @var int
   */
  public $offsetIndex;

  /**
   * String ,number, or  object for specific search txt in query
   *
   * @var any
   */
  public $searchText;
}
