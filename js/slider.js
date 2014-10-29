/**
 * Pragma.Libs.Slider
 * Plugin para el deslizador de contenidos.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-slider : define el plugin.
 * data-slider-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Slider.go_to([id])          : Muestra el panel con id suministrado.
 * Slider.prev()               : Muestra el panel anterior al actual. Si el panel actual es el primero y 
 *                               está activada la opción cyclic, irá al último panel.
 * Slider.next()               : Muestra el panel siguiente al actual. Si el panel actual es el último y 
 *                               está activada la opción cyclic, irá al primer panel.
 * Slider.get_items_count()    : Devuelve el número total de páneles del Slider.
 * Slider.get_current()        : Devuelve el id del panel activo.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.slider.before_init : Lanzado al inicializar el plugin.
 * pragma.slider.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.slider.changing    : Lanzado inmediatamente después de llamarse al método [go_to()].
 * pragma.slider.changed     : Evento lanzado al cambiar de panel y el mismo es visible para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/slider.less
 */
$(function( Pragma, $, undefined ) {
  "use strict";

  Pragma.Libs.Slider = function(element,options){
    var self = this;
    self.options = options;
    self.$el = element;
    self.timer = false;
    /**
     * Hace visible el panel con el id proporcionado.
     * @param  {number} id Id del panel.
     */
    self.go_to = function(id)
    {
      self.$el.trigger("pragma.slider.changing");

      if(self.$items[id] === undefined || id == self.current)
      {
        return;
      }

      if(self.options.autorun && self.timer !== false)
      {
        self.timer.stop();
      } 

      set_bg(self.$items[id]);

      animate(self.$items[self.current],self.$items[id],function(){
        self.$items[self.current].css("display","none");
        self.current = id;
        self.$items[id].css("display","block");
        animate_childs(self.$items[self.current]);
        if(self.options.autorun && self.timer !== false)
        {
          self.timer.play();
        }
        self.$el.trigger("pragma.slider.changed"); 
      });
    }
    /**
     * Va al panel anterior del actual. Si el panel actual es el primero y la opción 
     * [cyclic] está activada, irá al último panel del Slider.
     */
    self.prev = function()
    {
      var prev = (self.current - 1);
      if(prev < 1)
      {
        if(self.options.cyclic)
        {
          prev = self.get_items_count();
        }
        else
        {
          return;
        }
      }
      self.go_to(prev);
    }
    /**
     * Va al panel siguiente del actual. Si el panel actual es el último y la opción 
     * [cyclic] está activada, irá al primer panel del Slider.
     */
    self.next = function()
    {
      var next = (self.current + 1);
      if(next > self.get_items_count())
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
     * Devuelve la cantidad total de páneles dentro del Slider.
     * @return {number}
     */
    self.get_items_count = function()
    {
      return Pragma.Utils.count_object(self.$items);
    }

    /**
     * Devuelve el id del panel activo.
     * @return {number}
     */
    self.get_current = function(){
      return self.current;
    }
    /**
     * Anima la aparición del panel.
     * @param  {object}   $prev    Panel anterior.
     * @param  {object}   $current    Panel siguiente.
     * @param  {Function} callback Función a ejecutar luego de finalizar la animación.
     */
    function animate($prev,$current,callback)
    {
      var fx = self.options.fx;
      var fx_speed = self.options.fx_speed;
      var fx_easing = self.options.fx_easing;
      var _animate = false;

      if($current.attr("data-fx") !== undefined && $current.attr("data-fx").trim().length > 0)
      {
        fx = $current.attr("data-fx");
      }
      if($current.attr("data-speed") !== undefined && $current.attr("data-speed").trim().length > 0)
      {
        fx_speed = $current.attr("data-speed");
      }
      if($current.attr("data-easing") !== undefined && $current.attr("data-easing").trim().length > 0)
      {
        fx_easing = $current.attr("data-easing");
      }
      if(typeof callback != "function")
      {
        callback = function(){};
      }
      if(typeof self.options.animate[fx] == "function")
      {
        _animate = self.options.animate[fx];
      }
      else
      {
        if(typeof Pragma.Libs.Slider.Animate[fx] == "function")
        {
          _animate = Pragma.Libs.Slider.Animate[fx];
        }
        else
        {
          _animate = Pragma.Libs.Slider.Animate["fade"];
        }
      }
      if(typeof _animate == "function")
      {
        _animate($prev,$current,self.$el,callback,fx_speed,fx_easing);
      }
      else
      {
        callback();
      }
    }
    /**
     * Establece el fondo del slider igual al del panel suministrado.
     * @param {object} $el Panel del cual se copiará el fondo.
     */
    function set_bg($el)
    {
      var css = $el.css(["background","background-color","background-position","background-image","background-repeat"]);
      self.$el.css(css);
    }
    /**
     * Anima el elemento hijo suministrado.
     * @param  {object} $el     Elemento hijo.
     * @param  {object} styles  Estilos del elemento hijo.
     * @param  {object} $parent Elemento padre.
     */
    function animate_child($el,styles,$parent)
    {
      var fx = false;
      var fx_speed = 400;
      var fx_easing = false;
      var fx_delay = 100;
      var _animate = false;

      if($el.attr("data-fx") !== undefined && $el.attr("data-fx").trim().length > 0)
      {
        fx = $el.attr("data-fx");
      }
      if($el.attr("data-speed") !== undefined && $el.attr("data-speed").trim().length > 0)
      {
        fx_speed = $current.attr("data-speed");
      }
      if($el.attr("data-easing") !== undefined && $el.attr("data-easing").trim().length > 0)
      {
        fx_easing = $el.attr("data-easing");
      }
      if($el.attr("data-delay") !== undefined && $el.attr("data-delay").trim().length > 0)
      {
        fx_delay = $el.attr("data-delay");
      }
      
      if(typeof self.options.animate_child[fx] == "function")
      {
        _animate = self.options.animate_child[fx];
      }
      else
      {
        if(typeof Pragma.Libs.Slider.AnimateChild[fx] == "function")
        {
          _animate = Pragma.Libs.Slider.AnimateChild[fx];
        }
      }
      if($el.data("Pragma.Slider.Child.Fx.Delay"))
      {
        window.clearTimeout($el.data("Pragma.Slider.Child.Fx.Delay"));
      }
      if(typeof _animate == "function")
      {
        $el.css(styles);
        var parentHeight = ($parent.get(0).style.height == "")?"auto":$parent.get(0).style.height;
        var callback = function(){
          $el.css(styles.css);
          $parent.css("height",parentHeight);
        }
        $parent.css("height",$parent.outerHeight());
        _animate($el,styles,$parent,callback,fx_speed,fx_easing,fx_delay);
      }
    }
    /**
     * Configura y anima los elementos hijos del panel suministrado.
     * @param  {object} $parent Panel.
     */
    function animate_childs($parent)
    {

      $parent.find("[data-fx]").each(function(){
        var $el = $(this);

        var styles = $el.data("Pragma.Slider.Child.Styles");
        if(!styles)
        {
          styles = {
            css : {
              opacity : parseInt($el.css("opacity")),
              position : $el.css("position"),
              display  : $el.css("display")
            },
            computed : {
              height : $el.outerHeight(),
              width  : $el.outerWidth(),
              top    : $el.position().top,
              left   : $el.position().left,
              offset : $el.offset(),
              opacity : parseInt($el.css("opacity")),
              position : $el.css("position"),
              display  : $el.css("display")
            }
          }
          var props = ["height","width","top","left","bottom","right"];
          $.each(props,function(k,prop){
            styles.css[prop] = ($el.get(0).style[prop] == "")?"auto":$el.get(0).style[prop];
          });
          props = ["marginLeft","marginTop","marginBottom","marginRight"];
          
          $.each(props,function(k,prop){
            styles.css[prop] = ($el.get(0).style[prop] == "")?0:$el.get(0).style[prop];
            styles.computed[prop] = parseInt($el.css(prop));
          });
          $el.data("Pragma.Slider.Child.Styles",styles);
        }
      });
      $parent.find("[data-fx]").each(function(){
        animate_child($(this),$(this).data("Pragma.Slider.Child.Styles"),$parent);
      });
    }
    /**
     * Configura la navegación.
     */
    function configure_navigation()
    {
      if(self.options.add_nav)
      {
        var $prev = $('<a href="#" class="nav prev">').html(self.options.nav_prev_text)
                                                      .css("left",self.options.margins)
                                                      .appendTo(self.$el)
                                                      .click(function(e){
                                                        e.preventDefault();
                                                        self.prev();
                                                      });
        var $current = $('<a href="#" class="nav next">').html(self.options.nav_next_text)
                                                      .css("right",self.options.margins)
                                                      .appendTo(self.$el)
                                                      .click(function(e){
                                                        e.preventDefault();
                                                        self.next();
                                                      });
        var left = $prev.outerWidth() + (parseInt(self.options.margins) * 2);
        var right = $current.outerWidth() + (parseInt(self.options.margins)*2);
        $.each(self.$items,function(id,$item){
          $item.css({
            paddingLeft : left,
            paddingRight: right 
          });
        });
      }
    }
    /**
     * Configura la paginación
     */
    function configure_pagination()
    {
      if(!self.options.add_pagination)
      {
        return;
      }
      
      var $pagination = $('<ul class="slider-pagination">');

      if(self.options.pagination_style == "thumbs")
      {
        $pagination.addClass("thumbs");
        $.each(self.$items,function(id,$item)
        {
          var $pItem = $('<li>').attr("data-item-id",id).appendTo($pagination);
          var $pLink = $('<a href="#">').appendTo($pItem);

          if($(this).attr("data-pagination-icon") !== undefined)
          {
            $pLink.html($(this).attr("data-pagination-icon"));
          }
          else if($(this).attr("data-pagination-thumb") !== undefined)
          {
            $pLink.css("background-image","url("+$(this).attr("data-pagination-thumb")+")");
          }
          else
          {
            $pLink.css("background-image",$(this).css("background-image"));
          }

          $pLink.click(function(e){
            e.preventDefault();
            self.go_to($(this).parent().attr("data-item-id"));
          });
        });
      }
      else
      {
        $pagination.addClass("bullets");
        $.each(self.$items,function(id,$item)
        {
          var $pItem = $('<li>').attr("data-item-id",id).appendTo($pagination);
          var $pLink = $('<a href="#">').html((self.options.show_pagination_number)?id:"").appendTo($pItem);
          $pLink.click(function(e){
            e.preventDefault();
            self.go_to($(this).parent().attr("data-item-id"));
          });
        })
      }
      $pagination.appendTo(self.$el).find("li:first-child").addClass("active");


      self.$el.on("pragma.slider.changed",function(e){
        $pagination.find(" > li").each(function(e){
          $(this).removeClass("active");
          if($(this).attr("data-item-id") == self.current)
          {
            $(this).addClass("active");
          }
        });
      });
      //Posición vertical (top/bottom)
      if(self.options.pagination_position == "top")
      {
        $pagination.css("top",self.options.margins);
        
      }else
      {
        $pagination.css("bottom",self.options.margins);
      }
      var padding = $pagination.outerHeight()+ (parseInt(self.options.margins)*2);

      $.each(self.$items,function(id,$item){
        $item.css({
          paddingTop : padding,
          paddingBottom : padding
        });
      });


      //Alineación horizontal (left,center,right)
      switch(self.options.pagination_align)
      {
        case "left":
          $pagination.css("left",self.options.margins);
        break;
        case "right":
          $pagination.css("right",self.options.margins);
        break;
        default:
          $pagination.css({
            left: "50%",
            marginLeft : -($pagination.outerWidth()/2)
          });
        break;
      }
    }
    /**
     * Configura la altura de los páneles.
     */
    function configure_height(){
      var height = "auto";
      if(self.options.height)
      {
        height = self.options.height;
      }
      else
      {
        if(self.options.equalize)
        {
          height = 0;
          $.each(self.$items,function(k,$item){
            $(this).css({display:"block",height:"auto"});
            if($(this).outerHeight() > height)
            {
              height = $(this).outerHeight();
            }
            $(this).css("display","none");
          });
          //Reconfigura la altura al redimensionar la página.
          $(window).on("resize",function(){
            configure_height();
          })
        }
      }
      $.each(self.$items,function(k,$item){
        $(this).css("height",height);
      });
    }
    /**
     * Configura los páneles.
     */
    function configure_items()
    {
      self.$items = {},
      self.current = 0;
      self.$el.find(" > *").each(function(k){
        var id = (k+1);
        $(this).addClass("item").attr("data-slide-id",id);
          $(this).css("display","none");
          self.$items[id] =  $(this);
      });
    }
    /**
     * Configura el cronómetro para el desplazamiento automático de los páneles.
     */
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
    }
    /**
     * Configura el plugin.
     */
    function configure()
    {
      self.$el.trigger("pragma.slider.before_init");
      
      self.$el.addClass("slider");
      self.$el.css("display","block");
      configure_items();
      configure_navigation();
      configure_pagination();
      configure_timer();
      configure_height();
      self.current = 1;
      self.$items[self.current].css("display","block");
      animate_childs(self.$items[self.current]);
      if(self.options.autorun && self.timer !== false)
      {
        self.timer.play();
      }
      self.$el.trigger("pragma.slider.after_init");
    }
    configure();
  }

  //Versión del plugin
  Pragma.Libs.Slider.Ver = "1.0.0";


  //Opciones del plugin
  Pragma.Libs.Slider.Defaults = {
    autorun               : true,               //Determina si el carrusel moverá automáticamente a la siguiente 
                                                 //págtina.
    autorun_time          : 3000,                //Define el tiempo de espera antes de cambiar a la siguiente página
                                                 //automáticamente.
    pause_on_hover        : true,                //Define si deberá detenerse el cambio automático de página al 
                                                 //pasar el puntero sobre el carrusel.
    equalize              : true,               //define si se equalizará el contenido del slider
    cyclic                : true,                //Determina si la navegación será ciclica.
    add_nav               : true,                //determina si se agregarán las flechas de navegación
    nav_prev_text         : "&laquo;",           //texto de la flecha para ir a la página anterior
    nav_next_text         : "&raquo;",           //texto de la flecha para ir a la página siguiente
    add_pagination        : true,                //determina si se agregará la paginación del carusel
    pagination_position   : "bottom",            //posición de la paginación [top][bottom]
    pagination_align      : "center",            //alineación de la paginación [left][center][right]
    pagination_first_text : "&laquo;",           //texto del botón para ir a la página anterior
    pagination_prev_text  : "&lt;",              //texto del botón para ir a la primera página
    pagination_next_text  :"&gt;",               //texto del botón para ir a la página siguiente
    pagination_last_text  : "&raquo",            //texto del botón para ir a la última página
    show_pagination_number: true,                //Determina si se mostrará o no el número de las 
                                                 //páginas en la paginación.
    pagination_style      : "",                  //estilo de la paginación
    margins        : 10,
    fx             : "slide",
    fx_speed       : 400,
    fx_easing      : false,
    animate : {},
    animate_child : {}
  };



  //Efectos de animación para los elementos hijo de un panel
  Pragma.Libs.Slider.AnimateChild = {
    /**
     * Hace visible el elemento con un degradado.
     * @param  {object}   $el       Elemento por aplicar el efecto.
     * @param  {object}   styles    Estilos previos de la animación.
     * @param  {object}   $parent   Panel padre del elemento.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad enmilisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     * @param  {number}   fx_delay  Tiempo en milisegundos de espera antes de comenzar la animación.
     */
    fade : function($el,styles,$parent,callback,fx_speed,fx_easing,fx_delay)
    {

      $el.css("opacity",0);

      $el.data("Pragma.Slider.Child.Fx.Delay",
        window.setTimeout(function(){
          $el.finish().animate({opacity:styles.computed.opacity},fx_speed,fx_easing,function(){
            callback();
          });
        },fx_delay));
    },
    /**
     * Hace visible el elemento mostrándolo desde el extremo derecho del panel hasta su posición real.
     * @param  {object}   $el       Elemento por aplicar el efecto.
     * @param  {object}   styles    Estilos previos de la animación.
     * @param  {object}   $parent   Panel padre del elemento.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad enmilisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     * @param  {number}   fx_delay  Tiempo en milisegundos de espera antes de comenzar la animación.
     */
    slide_left : function($el,styles,$parent,callback,fx_speed,fx_easing,fx_delay)
    {
      var css = {
        width : $el.outerWidth(),
        top : styles.computed.top,
        left: "100%",
        position : "absolute"
      }
      $el.css(css);

      $el.data("Pragma.Slider.Child.Fx.Delay",
        window.setTimeout(function(){
          $el.finish().animate({left: styles.computed.left},fx_speed,fx_easing,function(){
            callback();
          });
        },fx_delay));
    },
    /**
     * Hace visible el elemento mostrándolo desde el extremo izquierdo del panel hasta su posición real.
     * @param  {object}   $el       Elemento por aplicar el efecto.
     * @param  {object}   styles    Estilos previos de la animación.
     * @param  {object}   $parent   Panel padre del elemento.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad enmilisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     * @param  {number}   fx_delay  Tiempo en milisegundos de espera antes de comenzar la animación.
     */
    slide_right : function($el,styles,$parent,callback,fx_speed,fx_easing,fx_delay)
    {
      var css = {
        width : $el.outerWidth(),
        top : styles.computed.top,
        left: -$el.outerWidth(),
        position : "absolute",
      }
      $el.css(css);
      $el.data("Pragma.Slider.Child.Fx.Delay",
        window.setTimeout(function(){
          $el.finish().animate({left: styles.computed.left},fx_speed,fx_easing,function(){
            callback();
          });
        },fx_delay));
    },
    /**
     * Hace visible el elemento mostrándolo desde el extremo inferior del panel hasta su posición real.
     * @param  {object}   $el       Elemento por aplicar el efecto.
     * @param  {object}   styles    Estilos previos de la animación.
     * @param  {object}   $parent   Panel padre del elemento.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad enmilisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     * @param  {number}   fx_delay  Tiempo en milisegundos de espera antes de comenzar la animación.
     */
    slide_top : function($el,styles,$parent,callback,fx_speed,fx_easing,fx_delay)
    {
      var css = {
        width : $el.outerWidth(),
        height: $el.outerHeight(),
        top : $parent.outerHeight(),
        left: styles.computed.left,
        position : "absolute",
      }
      $el.css(css);

      $el.data("Pragma.Slider.Child.Fx.Delay",
        window.setTimeout(function(){
          $el.finish().animate({top: styles.computed.top},fx_speed,fx_easing,function(){
            callback();
          });
        },fx_delay));
    },
    /**
     * Hace visible el elemento mostrándolo desde el extremo superior del panel hasta su posición real.
     * @param  {object}   $el       Elemento por aplicar el efecto.
     * @param  {object}   styles    Estilos previos de la animación.
     * @param  {object}   $parent   Panel padre del elemento.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad enmilisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     * @param  {number}   fx_delay  Tiempo en milisegundos de espera antes de comenzar la animación.
     */
    slide_bottom : function($el,styles,$parent,callback,fx_speed,fx_easing,fx_delay)
    {
      var css = {
        width : $el.outerWidth(),
        height: $el.outerHeight(),
        top : -styles.computed.top,
        left: styles.computed.left,
        position : "absolute",
      }
      $el.css(css);
      $el.data("Pragma.Slider.Child.Fx.Delay",
        window.setTimeout(function(){
          $el.finish().animate({top: styles.computed.top},fx_speed,fx_easing,function(){
            callback();
          });
        },fx_delay));
    },
  }
  //Efectos de animación para los páneles.
  Pragma.Libs.Slider.Animate = {
    /**
     * Hace visible el panel con un efecto de degradado.
     * @param  {object}   $prev     Panel previo.
     * @param  {object}   $current  Panel actual.
     * @param  {object}   $parent   Elemento padre del panel.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad en milisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     */
    fade : function($prev,$current,$parent,callback,fx_speed,fx_easing)
    {
      $prev.finish().fadeOut(fx_speed,fx_easing,function(){callback()});
    },
    /**
     * Hace visible el panel mostrándolo de izquierda a derecha o de derecha a izquierda.
     * Si el id del elemento actual es mayor al del previo, lo mostrará de izquierda a derecha, 
     * de lo contrario, de derecha a izquierda.
     * @param  {object}   $prev     Panel previo.
     * @param  {object}   $current  Panel actual.
     * @param  {object}   $parent   Elemento padre del panel.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad en milisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     */
    slide : function($prev,$current,$parent,callback,fx_speed,fx_easing)
    {
      if($prev.attr("data-slide-id") > $current.attr("data-slide-id"))
      {
        Pragma.Libs.Slider.Animate.slide_right($prev,$current,$parent,callback,fx_speed,fx_easing);
      }
      else
      {
        Pragma.Libs.Slider.Animate.slide_left($prev,$current,$parent,callback,fx_speed,fx_easing);
      }
    },
    /**
     * Hace visible el panel moviéndolo de izquierda a derecha.
     * @param  {object}   $prev     Panel previo.
     * @param  {object}   $current  Panel actual.
     * @param  {object}   $parent   Elemento padre del panel.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad en milisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     */
    slide_right : function($prev,$current,$parent,callback,fx_speed,fx_easing)
    {
      var width = $prev.outerWidth();
      $parent.css("height",$prev.outerHeight());
      $prev.css({
        position   : "absolute",
        display    : "block",
        marginLeft : 0
      });
      $prev.finish().animate({
        marginLeft: (width*2)
      },fx_speed,fx_easing,function(){
        $parent.css("height","auto");
        $prev.css({
          position: "relative",
          display : "none",
          marginLeft : 0,
        });
        callback();
      });
    },
    /**
     * Hace visible el panel moviéndolo de derecha  a izquierda.
     * @param  {object}   $prev     Panel previo.
     * @param  {object}   $current  Panel actual.
     * @param  {object}   $parent   Elemento padre del panel.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad en milisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     */
    slide_left : function($prev,$current,$parent,callback,fx_speed,fx_easing)
    {
      var width = $prev.outerWidth();
      $parent.css("height",$prev.outerHeight());
      $prev.css({
        position   : "absolute",
        display    : "block",
        marginLeft : 0
      });
      $prev.finish().animate({
        marginLeft: -width
      },fx_speed,fx_easing,function(){
        $parent.css("height","auto");
        $prev.css({
          position: "relative",
          display : "none",
          marginLeft : 0,
        });
        callback();
      });
    },
    /**
     * Hace visible el panel moviéndolo de abajo hacia arriba.
     * @param  {object}   $prev     Panel previo.
     * @param  {object}   $current  Panel actual.
     * @param  {object}   $parent   Elemento padre del panel.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad en milisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     */
    slide_top : function($prev,$current,$parent,callback,fx_speed,fx_easing)
    {
      var height = $prev.outerHeight();
      $parent.css("height",height);
      $prev.css({
        position   : "absolute",
        display    : "block",
        marginTop : 0
      });
      $prev.finish().animate({
        marginTop: -height
      },fx_speed,fx_easing,function(){
        $prev.css({
          position: "relative",
          display : "none",
          marginTop : 0,
        });
        $parent.css("height","auto");
        callback();
      });
    },
    /**
     * Hace visible el panel moviéndolo de arriba hacia abajo.
     * @param  {object}   $prev     Panel previo.
     * @param  {object}   $current  Panel actual.
     * @param  {object}   $parent   Elemento padre del panel.
     * @param  {Function} callback  Función a ejecutar al finalizar la animación.
     * @param  {number}   fx_speed  Velocidad en milisegundos de la animación.
     * @param  {string}   fx_easing Efecto easing por aplicar.
     */
    slide_bottom : function($prev,$current,$parent,callback,fx_speed,fx_easing)
    {
      var height = $prev.outerHeight();
      $parent.css("height",height);
      $prev.css({
        position   : "absolute",
        display    : "block",
        marginTop : 0
      });
      $prev.finish().animate({
        marginTop: (height*2)
      },fx_speed,fx_easing,function(){
        $prev.css({
          position: "relative",
          display : "none",
          marginTop : 0,
        });
        $parent.css("height","auto");
        callback();
      });
    }
  };
  //Inicialización del plugin al cargar la página de los elementos con el atributo [data-pragma-slider]
  $(function() {
    $("[data-pragma-slider]").each(function(e){
      $(this).pragma("slider");
    });
  });
}( window.Pragma = window.Pragma || {}, jQuery ));