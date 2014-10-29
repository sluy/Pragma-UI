/**
 * Pragma.Libs.Carousel
 * Plugin para el carrusel de contenidos.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-carousel : define el plugin.
 * data-carousel-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Carousel.go_to([page])        : Muestra la página [page].
 * Carousel.prev()               : Muestra la página anterior a la actual. Si la página actual es la primera y 
 *                                 está activada la opción cyclic, irá a la última página.
 * Carousel.next()               : Muestra la página siguiente a la actual. Si la página actual es la última y 
 *                                 está activada la opción cyclic, irá a la primera página.
 * Carousel.get_items_count()    : Devuelve el número de ítems contenidos en el carrusel.
 * Carousel.get_items_per_page() : Devuelve el número de items que se debe mostrar por página.
 * Carousel.get_total_pages()    : Devuelve el total de páginas del carrusel.
 * Carousel.get_current_page()   : Devuelve el número de la página actual.
 * Carousel.get_first([page])    : Devuelve el id del primer item de la página [page].
 * Carousel.resize()             : Redimensiona todos los elementos del carrusel y reconfigura la cantidad de páginas,
 *                                 items por página, paginaciones, etc.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.carousel.before_init : Lanzado al inicializar el plugin.
 * pragma.carousel.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.carousel.changing    : Lanzado inmediatamente después de llamarse al método [go_to()].
 * pragma.carousel.changed     : Evento lanzado al cambiar de página y el contenido de la misma es visible para el 
 *                               usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/pagination.less
 * less/carousel.less
 */
$(function( Pragma, $, undefined ) {
  "use strict";

  Pragma.Libs.Carousel = function(element,options){
    var self = this;
    self.options = options;
    self.$el = element;
    self.timer = false;
    /**
     * Muestra la página suministrada.
     * @param  {number} page Número de la página.
     */
    self.go_to = function(page)
    {
      if(self.$items[self.get_first(page)] === undefined)
      {
        return;
      }
      self.$el.trigger("pragma.carousel.changing");

      if(self.timer)
      {
        self.timer.stop();
      }

      var item_id = self.get_first(page);
      var width = self.$items[item_id].outerWidth();

      self.$list.animate({marginLeft: width*-(item_id-1)},function(){
        self.current = item_id;
        $.each(self.pagination,function(k,pagination){
          self.pagination[k].find("li").each(function(){
            $(this).removeClass("active");
            if($(this).attr("data-page-id") == page)
            {
              $(this).addClass("active");
            }
          });
          preload(page);
          if(self.options.autorun)
          {
            self.timer.play();
          }
          self.$el.trigger("pragma.carousel.changed");
        });
      });
    }
    /**
     * Muestra la página anterior a la actual.
     * Si la página actual es la primera y está activada la opción [cyclic], irá a la última página.
     */
    self.prev = function()
    {
      var prev = self.get_current_page()-1;
      if(prev < 1)
      {
        if(self.options.cyclic)
        {
          prev = self.get_total_pages();
        }
        else
        {
          return;
        }
      }
      self.go_to(prev);
    }
    /**
     * Muestra la página siguiente a la actual.
     * Si la página actual es la última y está activada la opción [cyclic], irá a la primera página.
     */
    self.next = function()
    {
      var next = self.get_current_page()+1;
      if(next > self.get_total_pages())
      {
        if(self.options.cyclic)
        {
          next = 1;
        }
        else
        {
          return;
        }
        
      }
      self.go_to(next);
    }
    /**
     * Devuelve el número de ítems por página.
     * @return {number}
     */
    self.get_items_per_page = function()
    {
      var device = Pragma.Utils.get_device();
      var devices = ["xs","sm","md","lg"];
      for(var n=$.inArray(device,devices);n>0;n--)
      {
        if(self.options[devices[n]+"_items"] != "inherit" && typeof self.options[devices[n]+"_items"] == "number")
        {
          return self.options[devices[n]+"_items"];
        }
      }
      return self.options.xs_items;
    }
    /**
     * Devuelve el número de la página actual.
     * @return {number}
     */
    self.get_current_page = function()
    {
      return Math.ceil(self.current/self.get_items_per_page());
    }
    /**
     * Devuelve la cantidad de páginas totales del carrusel.
     * @return {number}
     */
    self.get_total_pages = function()
    {
      return Math.ceil(Pragma.Utils.count_object(self.$items)/self.get_items_per_page());
    }
    /**
     * Devuelve la cantidad de ítems presentes en el carrusel.
     * @return {number}
     */
    self.get_items_count = function()
    {
      return Pragma.Utils.count_object(self.$items);
    }
    /**
     * Devuelve el número del primer ítem de la página suministrada.
     * @param  {[type]} page Número de la página de la cual se desea obtener el primer ítem.
     * @return {number}
     */
    self.get_first = function(page)
    {
      if(page < 0)
      {
        return 1;
      }
      return (page * self.get_items_per_page()) - (self.get_items_per_page()-1);
    }
    /**
     * Redimensiona todos los elementos del carrusel y reconfigura la cantidad de páginas,
     * items por página, paginaciones, etc.
     */
    self.resize = function()
    {
      if(self.options.add_nav)
      {
        self.$wrapper.css({
          marginLeft: self.nav.$prev.outerWidth(),
          marginRight: self.nav.$prev.outerWidth()
        });
      }
      if(self.get_items_count() > 0)
      {
        var width = self.$wrapper.width()/self.get_items_per_page();
        var height=0;
        var equalize = 0;

        self.$content.css("height","auto");
        $.each(self.$items,function(id,$item){
          $item.css("width",width).removeClass("active");
          if(id == self.current)
          {
            $item.addClass("active");
          }
          if(self.options.equalize)
          {
            var $first = $item.find(" > * "+self.options.equalize_selector);
            if($first.length > 0)
            {
              $first.css("height","auto");
              if($first.outerHeight() > equalize)
              {
                equalize = $first.outerHeight();
              }
            }
          }  
          if($item.outerHeight() > height)
          {
            height = $item.outerHeight();
          }
        }); 
        if(self.options.equalize)
        {
          $.each(self.$items, function(id,$item){
            $item.find(" > * "+self.options.equalize_selector).css("height",equalize);
          });
        }
        self.$list.css("width",width*self.get_items_count());
        configure_pagination_items();
      }
    }
    /**
     * Precarga las imágenes/vídeos de los items de la página suministrada.
     * @param  {[numeric]} page Número de la página.
     */
    function preload(page)
    {
      var item_id = self.get_first(page);
      for(var n = item_id; n < (item_id + self.get_items_per_page());n++)
      {
        if(self.$items[n] === undefined)
        {
          break;
        }
        self.$items[n].find("[data-src]").each(function(){
           $(this).css("display","none");
          var $preload = $('<div class="preload">').html(self.options.preload_text).insertAfter($(this));
          var src = $(this).attr("data-src");
          $(this).removeAttr("data-src");
          
          $(this).load(function(){
            $preload.remove();
            $(this).css("display","block");
            $(this).fadeIn(500,function(){
              self.resize();
            });
          }).error(function(){
            $(this).remove();
          }).attr("src",src);
        });
      }
    }
    /**
     * Configura los ítems de la paginación.
     */
    function configure_pagination_items()
    {
        self.pagination.$top.remove();
        self.pagination.$bottom.html("");

        var $first = $('<li>').appendTo(self.pagination.$bottom);
        var $prev = $('<li>').appendTo(self.pagination.$bottom);
        
        $("<a href='#'>").html(self.options.pagination_first_text).click(function(e){
          e.preventDefault();
          self.go_to(1);
        }).appendTo($first);

        $("<a href='#'>").html(self.options.pagination_prev_text).click(function(e){
          e.preventDefault();
          self.prev();
        }).appendTo($prev);

        for(var n=1;n <= self.get_total_pages();n++)
        {
          var $item = $('<li data-page-id="'+n+'">');
          var $link = $('<a href="#">').appendTo($item).click(function(e){
            e.preventDefault();
            self.go_to($(this).parent().attr("data-page-id"));
          });
          if(n == self.get_current_page())
          {
            $item.addClass("active");
          }
          if(self.options.show_pagination_number)
          {
            $link.html(n);
          }
          $item.appendTo(self.pagination.$bottom);
        }

        var $next = $('<li>').appendTo(self.pagination.$bottom);
        var $last = $('<li>').appendTo(self.pagination.$bottom);
        $("<a href='#'>").html(self.options.pagination_next_text).click(function(e){
          e.preventDefault();
          self.next();
        }).appendTo($next);

        $("<a href='#'>").html(self.options.pagination_last_text).click(function(e){
          e.preventDefault();
          self.go_to(self.get_total_pages());
        }).appendTo($last);

        self.pagination.$top = self.pagination.$bottom.clone(true,true);
        self.go_to(self.get_current_page());
    }
    /**
     * Configura los ítems del carrusel.
     */
    function configure_items()
    {
      self.current = 1;
      self.$items = {};
      self.$content = $('<div class="content"></div>');
      self.$wrapper = $('<div class="wrapper"></div>').appendTo(self.$content);
      self.$list = $('<ul class="item-list">').appendTo(self.$wrapper);

      self.$el.css("display","block");
      self.$el.find("> *").each(function(k){
        var id = (k+1);
        var $item = $('<li class="item" data-item-id="'+id+'">').appendTo(self.$list);
        $(this).appendTo($item);
        self.$items[id] = $item;
      });
      self.$content.appendTo(self.$el);
    }
    /**
     * Configura la navegación del carrusel.
     */
    function configure_nav()
    {
      self.$content.find(" > .nav").remove();
      self.nav = {
        $prev : $('<a href="prev" class="nav prev">').html(self.options.nav_prev_text),
        $next : $('<a href="next" class="nav next">').html(self.options.nav_next_text)
      }
      self.nav.$prev.click(function(e){
        e.preventDefault();
        self.prev();
      });
      self.nav.$next.click(function(e){
        e.preventDefault();
        self.next();
      });
      if(self.options.add_nav)
      {
        self.nav.$prev.appendTo(self.$content);
        self.nav.$next.appendTo(self.$content);
      }
    }
    /**
     * Configura la paginación, creando los elementos base de la misma.
     */
    function configure_pagination()
    {
      self.$content.find(" > pagination").each(function(){
        $(this).remove();
      })
      self.pagination = {
        $top    : $('<ul class="pagination">').addClass(self.options.pagination_style), 
        $bottom : $('<ul class="pagination">').addClass(self.options.pagination_style)
      }

      if(self.options.pagination_position == "top" || self.options.pagination_position == "both")
      {
        self.pagination.$top.prependTo(self.$el);
      }

      if(self.options.pagination_position == "bottom" || self.options.pagination_position == "both")
      {
        self.pagination.$bottom.appendTo(self.$el);
      } 
    }
    /**
     * Configura el arrastrar y soltar en el carrusel para dispositivos táctiles y regulares (mouse).
     */
    function configure_drag_and_drop()
    {
      if(self.options.drag_and_drop)
      {
        attach_drag_and_drop("touch");
        attach_drag_and_drop("mouse");
      }
    }
    /**
     * Agrega los eventos de arrastrar y soltar para el dispositivo dado.
     * @param  {[type]} device Dispositivo [touch][mouse]
     */
    function attach_drag_and_drop(device){
      var e_start = "touchstart"
      var e_move = "touchmove";
      var e_end  = "touchend";
      if(device != "touch")
      {
        e_start = "mousedown";
        e_move = "mousemove";
        e_end = "mouseup";
      }
      self.dragging = false;
      self.$list.on(e_start,function(e){
        self.$list.addClass("dragging");
        self.dragging = true;

        var css = {
          zIndex : self.$list.css("z-index"),
          width  : self.$list.outerWidth(),
          x      : self.$list.offset().left + self.$list.outerWidth() - e.pageX,
          marginLeft : parseInt(self.$list.css("margin-left"))
        }
        self.$list.css('z-index', 1000).parents().on(e_move, function(e) {
          self.$wrapper.find(" > .dragging").css({
            marginLeft : e.pageX + css.x - css.width,
          }).on(e_end, function(e) {
            if(self.dragging){
              var marginLeft = parseInt($(this).css("margin-left"));
              var movement = marginLeft - css.marginLeft;
              $(this).removeClass('dragging');
              if(movement<0)
                movement = movement*(-1);
              if(movement < 60){
                $(this).css(css);
              }else{
                if(marginLeft < css.marginLeft){
                  self.next();
                }else{
                  self.prev();
                }                
              }
            }
            self.dragging = false;
            $(this).unbind(e_end);
            self.$list.css('z-index', 1000).parents().unbind(e_move);
          });
        });
        e.preventDefault();
      });

    }
    //configura el timer para el movimiento automático de las páginas
    function configure_timer()
    {
      if(!self.options.autorun)
      {
        return;
      }
      self.$el.mouseenter(function(e){
        self.timer.pause();
      }).mouseleave(function(e){
        self.timer.play();
      });
      self.timer = new Pragma.Utils.timer(self.options.autorun_time);
      self.timer.addCallback(function(){
        self.next();
      });
      self.timer.play();
    }

    /**
     * Configuración inicial del plugin.
     */
    function configure()
    {
      self.$el.trigger("pragma.carousel.before_init");
      configure_items();
      configure_nav();
      configure_pagination();
      configure_timer();
      self.$el.css("display","block");
      self.resize();
      $(window).on("resize",function(e){
        self.resize();
      });
      configure_drag_and_drop();



      self.$el.trigger("pragma.carousel.after_init");
    }
    //Inicia la configuración del plugin.
    configure();
  }

  //Versión del plugin
  Pragma.Libs.Carousel.Ver = "1.0.0";
  /**Opciones**/
  Pragma.Libs.Carousel.Defaults = {
    autorun               : false,               //Determina si el carrusel moverá automáticamente a la siguiente 
                                                 //págtina.
    autorun_time          : 5000,                //Define el tiempo de espera antes de cambiar a la siguiente página
                                                 //automáticamente.
    pause_on_hover        : true,                //Define si deberá detenerse el cambio automático de página al 
                                                 //pasar el puntero sobre el carrusel.
    xs_items              : 3,                   //items a mostrar en dispositivos xs
    sm_items              : "inherit",           //items a mostrar en dispositivos sm
    md_items              : "inherit",           //items a mostrar en dispositivos md
    lg_items              : "inherit",           //items a mostrar en dispositivos lg
    equalize              : false,               //define si se equalizará el contenido del slider
    equalize_selector     : "",                  //selector del contenido que se ecualizará
    cyclic                : true,                //Determina si la navegación será ciclica.
    drag_and_drop         : false,
    preload_text          : 'cargando...',       //texto de la precarga de imágenes/videos
    add_nav               : true,                //determina si se agregarán las flechas de navegación
    nav_prev_text         : "&laquo;",           //texto de la flecha para ir a la página anterior
    nav_next_text         : "&raquo;",           //texto de la flecha para ir a la página siguiente
    add_pagination        : true,                //determina si se agregará la paginación del carusel
    pagination_position   : "bottom",            //posición de la paginación [top][bottom][both]
    pagination_first_text : "&laquo;",           //texto del botón para ir a la página anterior
    pagination_prev_text  : "&lt;",              //texto del botón para ir a la primera página
    pagination_next_text  :"&gt;",               //texto del botón para ir a la página siguiente
    pagination_last_text  : "&raquo",            //texto del botón para ir a la última página
    show_pagination_number: true,                //Determina si se mostrará o no el número de las 
                                                 //páginas en la paginación.
    pagination_style      : "center bullets xs"  //estilo de la paginación
  }
  //Inicializa el plugin en los elementos con el atributo [data-pragma-carousel] definido.
  $(function() {
    $("[data-pragma-carousel]").each(function(e){
      $(this).pragma("carousel");
    });
  });
}( window.Pragma = window.Pragma || {}, jQuery ));