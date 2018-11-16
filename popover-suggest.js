/*@preserve
  Popover Suggest v1.0.0 (https://popoversuggest.module-art.fr/)
  Copyright (C) 2018 Sylvestre Lambey 

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/gpl.html>.
*/

(function ( $ ) {
 
  $.fn.popsuggest = function( options ) {

    // This is the easiest way to have default options.
    var settings = $.extend({
        // These are the defaults.
      placement: 'right',
      dataUrl: 'data.html',
      chainLength: 2,
      rows: 8,
      separator : ',',
      addData : {}
    }, options );

    var limit = 'ok',
        n=-1,
        gi=0
        dataUrl = settings.dataUrl,
        separator = settings.separator,
        addData = settings.addData,
        rows = settings.rows;

    this.popover({
      placement: settings.placement,
      trigger:'manual',
      html: true
    });

    this.click(function(e){
        if(this.value.length >= settings.chainLength){
          getItems(this, this.value);
        }
    })
    .keyup(function(e){
      var chain='';
      if (e.keyCode==40||e.keyCode==38||e.keyCode==13){
        switch(e.keyCode){
        case 40: n+=1; break;
        case 38: n-=1; break;
        }
        limit=arrow(e.keyCode,n,this);
        if(limit=='over') n=-1;
      }else{

        chain=this.value;

        if(chain.length >= settings.chainLength){
          n=-1;
          getItems(this, chain);
        }else{
          $(this).popover('hide');
          $('.popover').remove();
        }
      }
    });
      
    $('body').on('click', function (e) {
      $('[data-toggle="popover"]').each(function () {
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
          $(this).popover('hide');
        }
      });
    });
    return this;
  };
 
  function getItems(selected, chain) {

    $('body').css('cursor', 'wait');
    $(selected).css('cursor', 'wait');

    $.ajax({
      method: 'post',
      url: dataUrl,
      data: $.extend({
        chain: chain
      }, addData)
    })
    .done(function(data) {

      $('body').css('cursor', 'default');
      $(selected).css('cursor', 'default');
    
      var list = data.split(separator),
          list_length = list.length,
          htmlist = document.createElement('div'),
          lines=rows,
          i;

      for(i=0; i<list_length; i++){
        if(i%lines==0){
          if(i==lines) htmlist.appendChild(newdiv);
          var newdiv= document.createElement('div');
          newdiv.style.display='inline-block';
          newdiv.style.marginTop='10px';
          newdiv.style.marginLeft='10px';
          newdiv.style.marginRight='10px';
          newdiv.style.cursor='pointer';
          newdiv.style.verticalAlign='top';
        }
        var newp = document.createElement('p');
        newp.className = 'result';
        newp.appendChild(document.createTextNode(list[i]));
        newdiv.appendChild(newp);
        if(i%lines==0 && i>0){
            htmlist.appendChild(newdiv);
        }
      }

      if(i<lines) htmlist.appendChild(newdiv);
      $(selected).attr("data-content", htmlist.outerHTML);
      $(selected).popover('show');
      setTimeout(function(){
        select_result(selected);
      },200)
    })
    .fail(function(data) {
      console.log(data);
      alert('Oups ! search fail.');
    });
  }

  function select_result(selected){
    
    var each_result = document.querySelectorAll('.result'),
        each_len = each_result.length;

    for(var i=0; i<each_len; i++){
      each_result[i].addEventListener('mouseover', function() {
        this.style.color = 'black';
      }, false);

      each_result[i].addEventListener('mouseout', function() {
        this.style.color = '#666';
      }, false);

      each_result[i].addEventListener('click', function(e) {
        selected.value = e.target.innerHTML;
        $(selected).popover('hide');
        $('.popover').remove();
        $(selected).trigger("popSelect");
      }, false);
    }
  }

  function arrow(code,n,selected){
    
    var each_result = document.getElementsByClassName('result'),
        each_len = each_result.length;

    for(var i=0; i<each_len; i++){
      each_result[i].style.color='#666';
    }
    if(code==40 && n<each_len){
      each_result[n].style.color='black';
      return 'ok';
    }else if(code==38 && n>=0){
      each_result[n].style.color='black';
      return 'ok';
    }else if(code==13 && n>=0 && n<each_len){
      selected.value = each_result[n].innerHTML;
      $(selected).popover('hide');
      $('.popover').remove();
      $(selected).trigger("popSelect");
      return 'ok';
    }else{
      return 'over';
    }
  }
}( jQuery ));
